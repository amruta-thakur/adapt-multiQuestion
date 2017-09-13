define([
    'backbone',
    'coreJS/adapt'
], function(Backbone, Adapt) {
    var AddButtonsMultiQuestionView = Backbone.View.extend({
        
        template: 'addButtonsMultiQuestionView',

        initialize:function(){
            this.listenTo(Adapt, 'remove', this.remove, this);
            this.renderButtons();
        },

        renderButtons:function(){
            var components;
            var allBlocks = this.model.getChildren().models;
            _.each(allBlocks,function(block,index){
                components = block.getChildren().models;
                _.each(components,function(component,indexCom){
                    var hasMultiQuestion = component.get("_multiQuestion");
                    if(hasMultiQuestion != undefined){
                        if(hasMultiQuestion._isEnabled != undefined && hasMultiQuestion._isEnabled != false){
                            var currentId = component.get("_id");
                            _.defer(_.bind(function () {
                                this.render(currentId);
                                this.addButtonsToView(currentId,hasMultiQuestion);
                                this.bindEvents(currentId);
                            }, this));
                        }
                    }
                },this);
            },this);
        },

        render:function(componentId){
            var $currentComponentInner = $("."+componentId).find(".component-inner");
            var template = Handlebars.templates[this.template];
            $currentComponentInner.append(template(this.model));
            return this;
        },

        addButtonsToView:function(currentId,hasMultiQuestion){
            var $currentComponentInner = $("."+currentId).find(".component-inner");
            var prevButton = hasMultiQuestion._prevButton;
            var tryAgainButton = hasMultiQuestion._tryAgainButton;
            var nextButton = hasMultiQuestion._nextButton;
            var prevTitle = hasMultiQuestion._prevTitle;
            var tryAgainTitle = hasMultiQuestion._tryAgainTitle;
            var nextTitle = hasMultiQuestion._nextTitle;
            var $prevButton = $currentComponentInner.find(".prev-button");
            var $tryAgainButton = $currentComponentInner.find(".try-again-button");
            var $nextButton = $currentComponentInner.find(".next-button");

            $prevButton.html(prevTitle);
            $tryAgainButton.html(tryAgainTitle);
            $nextButton.html(nextTitle);
            
            if(prevButton == true){
                $prevButton.removeClass("display-none");
            }else{
                if(!$prevButton.hasClass("display-none")){
                    $prevButton.addClass("display-none");
                }
            }
            if(tryAgainButton == true){
                $tryAgainButton.removeClass("display-none");
            }else{
                if(!$tryAgainButton.hasClass("display-none")){
                    $tryAgainButton.addClass("display-none");
                }
            }
            if(nextButton == true){
                $nextButton.removeClass("display-none");
            }else{
                if(!$nextButton.hasClass("display-none")){
                    $nextButton.addClass("display-none");
                }
            }
        },

        bindEvents:function(currentId){
            var $currentComponentInner = $("."+currentId).find(".component-inner");
            $currentComponentInner.find(".prev-button").on("click", _.bind(this.onPrevClicked, this));
            $currentComponentInner.find(".try-again-button").on("click", _.bind(this.onTryAgainClicked, this))
            $currentComponentInner.find(".next-button").on("click", _.bind(this.onNextClicked, this))
        },

        onPrevClicked:function(event){
            event.preventDefault();
            Adapt.trigger("multiQuestion:prevClicked");
        },

        onTryAgainClicked:function(event){
            event.preventDefault();
            Adapt.trigger("multiQuestion:tryAgainClicked");
        },

        onNextClicked:function(event){
            event.preventDefault();
            Adapt.trigger("multiQuestion:nextClicked");
        }
    });
    return AddButtonsMultiQuestionView;
});
