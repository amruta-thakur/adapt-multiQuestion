define([
    'backbone',
    'coreJS/adapt',
    './jquery.jsmodal'
], function(Backbone, Adapt, Lightbox) {
    var CustomViewShowCase = Backbone.View.extend({

        template:"customViewShowCase",

        initialize:function(){
            this.listenTo(Adapt, 'remove', this.remove);
            this.render();
        },

        render:function(){
            var template = Handlebars.templates[this.template];
            $("#wrapper").find(".page").append(template(this.model));
            return this;
        }

    });
    return CustomViewShowCase;
});

