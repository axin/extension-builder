using System;
using System.Runtime.InteropServices;
using Microsoft.Win32;
using SHDocVw;
using mshtml;

namespace {{{extensionName}}}
{
    [ComVisible(true),
    ClassInterface(ClassInterfaceType.None),
    Guid("{{{bhoClassGuid}}}")]
    public class {{{extensionName}}}Bho : IObjectWithSite {
        public static readonly Guid IID_IWebBrowserApp = new Guid("{0002DF05-0000-0000-C000-000000000046}");
        public static readonly Guid IID_IUnknown = new Guid("{00000000-0000-0000-C000-000000000046}");
        WebBrowserClass explorer;
        Object site;

        void IObjectWithSite.SetSite(Object newSite) {
            if (site != null) {
                Marshal.FinalReleaseComObject(site);
            }

            site = newSite;
            if (site != null) {
                IServiceProvider sp = site as IServiceProvider;
                Guid guid = IID_IWebBrowserApp;
                Guid riid = IID_IUnknown;

                object wba;
                sp.QueryService(
                    ref guid,
                    ref riid,
                    out wba);

                explorer = (WebBrowserClass)Marshal.CreateWrapperOfType(
                    wba as IWebBrowser,
                    typeof(WebBrowserClass));

                explorer.DocumentComplete += new DWebBrowserEvents2_DocumentCompleteEventHandler(explorer_DocumentComplete);

            } else {
                if (explorer != null) {
                    Marshal.FinalReleaseComObject(explorer);
                    explorer = null;
                }
            }
        }

        void explorer_DocumentComplete(object pDisp, ref object URL) {
            //Explorer is Object of SHDocVw.WebBrowserClass
            HTMLDocument htmlDoc = (HTMLDocument)this.explorer.IWebBrowser_Document;

            //inject Script
            htmlDoc.parentWindow.execScript("printHelloWorld()", "javascript");
            //throw new Exception("The method or operation is not implemented.");
        }

        void IObjectWithSite.GetSite(ref Guid riid, out Object outSite) {
            outSite = site;
        }

        [ComRegisterFunction]
        public static void RegisterBHO(Type t) {
            RegistryKey rk = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Browser Helper Objects", true);
            rk.CreateSubKey("{" + t.GUID.ToString() + "}");
        }

        [ComUnregisterFunction]
        public static void UnregisterBHO(Type t) {
            RegistryKey rk = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Browser Helper Objects", true);
            rk.DeleteSubKey("{" + t.GUID.ToString() + "}");
        }
    }

    #region interfaces
    [ComImport]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    [Guid("6d5140c1-7436-11ce-8034-00aa006009fa")]
    public interface IServiceProvider {
        void QueryService(
            ref Guid guid,
            ref Guid riid,
            [MarshalAs(UnmanagedType.Interface)] out Object Obj);
    }

    [ComImport]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    [Guid("FC4801A3-2BA9-11CF-A229-00AA003D7352")]
    public interface IObjectWithSite {
        void SetSite([In, MarshalAs(UnmanagedType.IUnknown)] Object pUnkSite);
        void GetSite(ref Guid riid, [MarshalAs(UnmanagedType.IUnknown)] out Object ppvSite);
    }
    #endregion
}
