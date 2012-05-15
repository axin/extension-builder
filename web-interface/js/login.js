(function () {
    var User = Backbone.Model.extend({
        defaults: {
            login: 'undefined',
            password: ''
        }
    });

    var Users = Backbone.Collection.extend({
        model: User
    });
}());
