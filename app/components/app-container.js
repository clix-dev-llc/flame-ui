import Ember from 'ember';

var get = Ember.get;
var set = Ember.set;
var setProperties = Ember.setProperties;

export default Ember.Component.extend({
    transactionStore: Ember.inject.service(),

    classNames: ['sd-app-container'],

    init: function() {
        this._super.apply(this, arguments);

        setProperties(this, {
            transaction:        null,
            aggregation:        null,
            transactionData:    null,
            span:               null,
            spanMode:           null,
            spanLog:            null
        });
    },

    chartPanelSize: Ember.computed('span', function() {
        return (this.get('span')) ? 'row-2' : 'row-3';
    }),

    actions: {
        selectTransaction: function(transaction, aggregation, defer) {
            var me = this;
            var currentAggregation = aggregation || get(this, 'aggregation') || 'avg';

            if (get(this, 'transaction') !== transaction || get(this, 'aggregation') !== currentAggregation) {
                setProperties(me, {
                    transaction: transaction,
                    aggregation: currentAggregation,
                    span:        null,
                });

                me.get('transactionStore').findTransaction(transaction, currentAggregation).then(function(result) {
                    setProperties(me, {
                        transaction:        transaction,
                        aggregation:        currentAggregation,
                        transactionData:    result
                    });
                });
                if (defer) { defer.resolve(); }
            } else {
                setProperties(me, {
                    transaction:        null,
                    transactionData:    null,
                    span:               null
                });
                if (defer) { defer.reject(); }
            }
        },

        changeAggregation(aggregation) {
            this.send('selectTransaction', this.get('transaction'), aggregation);
        },

        selectSpan: function(span) {
            var me = this;
            var currentMode = get(this, 'spanMode') || 'SPAN';

            if (get(me, 'span') !== span) {
                setProperties(me, {
                    span:       span,
                    spanMode:   currentMode
                });

                get(me, 'transactionStore').findSpanLog(span, currentMode).then(function(result) {
                    setProperties(me, {
                        span:       span,
                        spanMode:   currentMode,
                        spanLog:    result
                    });
                });
            } else {
                setProperties(me, {
                    span:       null,
                    spanMode:   null,
                    spanLog:    null
                });
            }
        },

        selectSpanMode: function(mode) {
            var me = this;
            var currentSpan = get(this, 'span');

            set(this, 'spanMode', mode);

            get(me, 'transactionStore').findSpanLog(currentSpan, mode).then(function(result) {
                setProperties(me, {
                    span:       currentSpan,
                    spanMode:   mode,
                    spanLog:    result
                });
            });
        }
    }
});
