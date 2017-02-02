/*
 * adapt-multiQuestion
 * License - http://github.com/amruta-thakur
 * Maintainer - Amruta Thakur <amruta.thakur@exultcorp.com>
 */

define([
    'backbone',
    'coreJS/adapt',
    './jquery.jsmodal'
], function(Backbone, Adapt, LightBox) {

    function initialize() {
        this.listenTo(Adapt, 'remove', this.remove);
    }

    function onDataReady() {
        Adapt.on('articleView:postRender', onArticleViewPostRender);
    }

    function onArticleViewPostRender(article) {
        if (article.model.get('_multiQuestion') && article.model.get('_multiQuestion')._isEnabled) {
            setUpBlockContentItems(article);
        }
    }

    function setUpBlockContentItems(article) {
        var MultiQuestion = Backbone.View.extend({
            initialize: function() {
                this.listenTo(Adapt, 'remove', this.remove, this);
                this.listenTo(Adapt,'customHotgraphic:itemClicked', this.onItemClicked);
                this.listenTo(Adapt,'notify:cancelled', this.onFeedbackCancelled);
                this.blockListLevelOne = this.model.get("_multiQuestion")._blockListLevelOne;
                this.blockListLevelTwo = this.model.get("_multiQuestion")._blockListLevelTwo;
                $(".close").on("click",_.bind(this.onCloseClicked,this));
                this.hideUnnecessaryBlocks();
            },

            hideUnnecessaryBlocks: function() {
                var allBlocks = this.model.getChildren().models;
                _.each(allBlocks, function(item, index) {
                    var id = item.get("_id");
                    _.each(this.blockListLevelOne,function(HideItem,index){
                        if (id == HideItem) {
                            $("." + id).addClass("display-none");
                        }
                    },this);
                    _.each(this.blockListLevelTwo,function(HideItem,index){
                        if (id == HideItem) {
                            $("." + id).addClass("display-none");
                        }
                    },this);
                }, this);
            },

            onItemClicked:function(event){
                $('body').scrollDisable();
                $currentItem = $(event.currentTarget);
                this.currentItemIndex = $currentItem.attr("data-id");
                this.showCurrentBlock(this.blockListLevelOne,this.currentItemIndex);
            },

            onFeedbackCancelled:function(){
                var levelOneBlockId = this.blockListLevelOne[this.currentItemIndex];
                if($("."+levelOneBlockId).hasClass("modal-show")){
                    $("."+levelOneBlockId).removeClass('modal-show');
                }
                this.showCurrentBlock(this.blockListLevelTwo,this.currentItemIndex);
            },

            showCurrentBlock:function(blockList,currentIndex){
                var currentBlockId = blockList[currentIndex];
                if(!$("."+currentBlockId).hasClass("modal")){
                    $("."+currentBlockId).addClass("enabled modal");
                    $("."+currentBlockId).removeClass('display-none');
                    $("."+currentBlockId).removeClass('visibility-hidden');
                }
                $("."+currentBlockId).modal();
            },
            onCloseClicked:function(event){
                $('body').scrollEnable();
            },
        });
        
        new MultiQuestion({
            model: article.model
        });
    }

    Adapt.once('app:dataReady', onDataReady);

});
