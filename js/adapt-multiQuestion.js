/*
 * adapt-multiQuestion
 * License - http://github.com/amruta-thakur
 * Maintainer - Amruta Thakur <amruta.thakur@exultcorp.com>,
 *             Chetan Hajare <chetan.hajare@exultcorp.com>
 */

define([
    'backbone',
    'coreJS/adapt',
    './jquery.jsmodal',
    './AddButtonsMultiQuestionView'
], function(Backbone, Adapt, LightBox, AddButtonsMultiQuestionView) {

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
                this.listenTo(Adapt, 'customHotgraphic:itemClicked', this.onItemClicked, this);
                this.listenTo(Adapt, 'multiQuestion:nextClicked', this.onNextButtonClicked, this);
                this.listenTo(Adapt, 'multiQuestion:tryAgainClicked', this.onTryAgainButtonClicked, this);
                this.listenTo(Adapt, 'multiQuestion:prevClicked', this.onPrevButtonClicked, this);

                this.hotGraphicListArray = this.model.get("_multiQuestion")._hotGraphicList;
                this.hideUnnecessaryBlocks();
                this.createViewForButtons();
                this.customViewCreated = "";
            },

            setBlockIds: function($currentItem) {
                this.blockListArray = [];
                var currentBlock = $currentItem.closest('.block');
                _.each(this.hotGraphicListArray, function(hotGraphicList) {
                    if (currentBlock.hasClass(hotGraphicList.currentBlockId)) {
                        this.currentBlockId = hotGraphicList.currentBlockId;
                        this.blockListArray = hotGraphicList._blockList;
                        this.isPresentationView = hotGraphicList._isPresentationView;
                        this.shouldUpdateIcon = hotGraphicList._shouldUpdateIcon;
                        return;
                    }
                }, this);
            },

            hideUnnecessaryBlocks: function() {
                _.each(this.hotGraphicListArray, function(hotGraphicList) {
                    _.each(hotGraphicList._blockList, function(blockList, index) {
                        _.each(blockList, function(blockId) {
                            $("." + blockId).addClass("display-none");
                        }, this);
                    }, this);
                }, this);
            },

            createViewForButtons: function() {
                if (this.customViewCreated == "" || this.customViewCreated == undefined) {
                    new AddButtonsMultiQuestionView({
                        model: this.model
                    });
                    this.customViewCreated = true;
                }
            },

            onItemClicked: function(event) {
                $('body').scrollDisable();
                this.listenTo(Adapt, 'popup:opened', this.onPopupOpened, this);
                $currentItem = $(event.currentTarget);
                this.currentItemIndex = $currentItem.attr("data-id");
                this.setBlockIds($currentItem);
                this.blockList = this.blockListArray[this.currentItemIndex];
                this.blockNumber = 0;
                this.showCurrentBlock();
            },

            onFeedbackCancelled: function() {
                $('body').scrollDisable();
                var levelOneBlockId = this.blockList[this.blockNumber];
                this.blockNumber++;
                if ($("." + levelOneBlockId).hasClass("modal-show")) {
                    $("." + levelOneBlockId).removeClass('modal-show');
                }
                if (this.blockList.length == this.blockNumber) {
                    Adapt.trigger("multiQuestion:secondBlockClosed", this.currentItemIndex, this.currentBlockId, this.shouldUpdateIcon);
                    $('body').scrollEnable();
                }
                this.showCurrentBlock();
            },

            showCurrentBlock: function() {
                var currentBlockId = this.blockList[this.blockNumber];
                this.currentPopUpBlock = Adapt.findById(currentBlockId);
                this.listenTo(this.currentPopUpBlock, 'change:_isInteractionComplete', this.enableCloseButton, this);
                if (currentBlockId == undefined) return;
                this.currentPopUpBlock.trigger('change:_isVisible');
                this.$('.' + currentBlockId).trigger('narrative:resize');
                if (!$("." + currentBlockId).hasClass("modal")) {
                    $("." + currentBlockId).addClass("enabled modal");
                    $("." + currentBlockId).removeClass('display-none');
                }
                this.checkIfCurrentBlockHasBlockSlider(currentBlockId);
                this.currentModal = $("." + currentBlockId).modal();
                if (this.isPresentationView == true) {
                    this.currentModelForPresentationView = this.currentModal;
                }
                this.currentModal.find(".close").addClass('display-none');
                this.currentModal.find(".nextModal").addClass('display-none');
                $('.' + currentBlockId).find('.component-inner').trigger('inview');
                this.currentModal.find('.close').on('click', _.bind(this.onCloseClicked, this));
                this.currentModal.find('.nextModal').on('click', _.bind(this.onCloseClicked, this));
            },

            checkIfCurrentBlockHasBlockSlider: function(currentBlockId) {
                if ($('.' + currentBlockId).find(".slider-inner") != undefined || $('.' + currentBlockId).find(".spriteSlider-inner") != undefined) {
                    _.delay(function() { Adapt.trigger("multiQuestion:hasSlider") }, 100);
                }
            },

            enableCloseButton: function() {
                this.stopListening(this.currentPopUpBlock, 'change:_isInteractionComplete', this.enableCloseButton, this);
                if (this.blockList.length - 1 == this.blockNumber) {
                    this.currentModal.find(".close").removeClass('display-none');
                } else {
                    this.currentModal.find(".nextModal").removeClass('display-none');
                }
            },

            onCloseClicked: function(event) {
                event.preventDefault();
                this.onFeedbackCancelled();
            },

            onNextButtonClicked: function() {
                this.onFeedbackCancelled();
            },

            onTryAgainButtonClicked: function() {
                var levelOneBlockId = this.blockList[this.blockNumber];
                if ($("." + levelOneBlockId).hasClass("modal-show")) {
                    $("." + levelOneBlockId).removeClass('modal-show');
                }
                $('body').scrollEnable();
            },

            onPrevButtonClicked: function() {
                $('body').scrollDisable();
                var levelOneBlockId = this.blockList[this.blockNumber];
                this.blockNumber--;
                if ($("." + levelOneBlockId).hasClass("modal-show")) {
                    $("." + levelOneBlockId).removeClass('modal-show');
                }
                this.showCurrentBlock();
            },

            onPopupOpened: function(event) {
                var shadow = $("body").find(".notify-shadow");
                console.log(shadow)
                shadow.css("z-index", "99999");
            }
        });
        new MultiQuestion({
            model: article.model
        });
    }

    Adapt.once('app:dataReady', onDataReady);

});