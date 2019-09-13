<template>
    <div ref="event_block" class="v-cal-event-item"
         :title="event.startTime | formatEventTime(use12) + ' - ' + event.displayText"
         :class="eventClasses"
         @click.stop="eventClicked"
         :style="eventStyles">
        <span v-if="isNewProposal || isRequestStillPending || isMeetingValidated" class="cal-event-icon">
            <span class="fa-stack">
                <i class="far fa-calendar fa-stack-2x"></i>
                <i class="fa-stack-1x" :class="iconEvent"></i>
            </span>
        </span>
        <span v-if="isGoogleEvent || isOutlookEvent" class="cal-event-icon">
            <span class="icon-single">
                <i :class="iconEvent"></i>
            </span>
        </span>
        <span class="v-cal-event-time">{{ event.startTime | formatEventTime(use12) }}</span>
        <span class="v-cal-event-name color-test">{{ event.displayText }}</span>
    </div>
</template>

<script>
    import moment from 'moment';
    import { EventBus } from './EventBus';

    export default {
        name: "EventItem",
        props: {
            event: {
                type: Object,
                required: true
            },
            use12: {
                type: Boolean,
                required: true
            },
            hasDynamicSize: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                ancestorHeight: 0
            }
        },
        mounted() {
            if ( this.hasDynamicSize ) {
                this.getAndSetAncestorHeight();
                window.addEventListener('resize', this.getAndSetAncestorHeight);
            }
        },
        beforeDestroy() {
            if ( this.hasDynamicSize )
                window.removeEventListener('resize', this.getAndSetAncestorHeight);
        },
        methods: {
            eventClicked() {
                EventBus.$emit('event-clicked', this.event);
            },
            getAndSetAncestorHeight() {
                this.ancestorHeight = this.findAncestor(this.$refs.event_block, 'v-cal-day__hour-content').offsetHeight;
            },
            findAncestor (el, cls) {
                while ((el = el.parentElement) && !el.classList.contains(cls)) ;
                return el;
            }
        },
        computed: {
            displayHeight() {

                const end = this.event.endTime.hours() > 0 ? moment(this.event.endTime) : moment(this.event.endTime).add(1, 'days');

                const hours = end.diff(this.event.startTime, 'hours', true);
                const bordersOffset = hours - 1;
                return  ( hours * this.ancestorHeight ) + bordersOffset;
            },
            eventStyles() {

                let styles = [];
                styles.push({
                    'backgroundColor': this.event.color,
                    'color': this.event.color,
                    '--current-event-color': this.event.color,
                });

                if ( this.hasDynamicSize ) {
                    styles.push({
                        'height': this.displayHeight + 'px',
                    });

                    if ( this.event.startTime.minutes() > 0 ) {
                        const distance = ( this.ancestorHeight / 60 ) * this.event.startTime.minutes();
                        styles.push({
                            'top': distance + 'px'
                        });
                    }
                }

                return styles;
            },
            isPlatformEvent() {
                return this.event.provider == 'platform';
            },
            isGoogleEvent() {
                return this.event.provider == 'google';
            },
            isOutlookEvent() {
                return this.event.provider == 'outlook';
            },
            isNewProposal() {
                return this.isPlatformEvent && this.event.status == 0 && this.event.isHost == false;
            },
            isRequestStillPending() {
                return this.isPlatformEvent && this.event.status == 0 && this.event.isHost == true;
            },
            isMeetingValidated() {
                return this.isPlatformEvent && this.event.status == 1;
            },
            iconEvent() {
                switch (this.event.provider) {
                    case 'platform':
                        if (this.isNewProposal) {
                            return 'fas fa-exclamation';
                        } else if(this.isRequestStillPending) {
                            return 'fas fa-question';
                        } else if (this.isMeetingValidated) {
                            return 'fas fa-check';
                        }
                        return '';
                    case 'google':
                        return 'fab fa-google';
                    case 'outlook':
                        return 'fab fa-microsoft';
                }
            },
            eventClasses() {
                return {}
            }
        },
        filters: {
            formatEventTime(hour, use12 = false) {
                if ( !hour )
                    return '';

                if ( use12 )
                    return hour.format( hour.minutes() > 0 ? 'h.mma' : 'ha' ).slice(0, -1);

                return hour.format( hour.minutes() > 0 ? 'HH.mm' : 'HH' );
            }
        },
    }
</script>

<style scoped>

</style>