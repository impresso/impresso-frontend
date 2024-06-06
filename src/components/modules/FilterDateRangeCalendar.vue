<template>
  <div class="FilterDateRange d-flex">
    <div class="flex-grow-1">
      <div class="input-group mb-1">
        <b-form-input
          size="sm"
          id="start-date-datepicker"
          v-model="startValueInput"
          type="text"
          placeholder="..."
          autocomplete="off"
        ></b-form-input>
        <div class="input-group-append" v-if="showCalendar">
          <DatepickerButton
            size="sm"
            locale="en-US"
            :min="minDate"
            :max="maxDate"
            v-model="startValueCalendar"
            required
            button-variant="outline-secondary"/>
        </div>
      </div>
    </div>
    <div class="flex-shrink-1 mx-2">
      to
    </div>
    <div class="flex-grow-1">
      <div class="input-group mb-1">
        <b-form-input
          size="sm"
          id="end-date-datepicker"
          v-model="endValueInput"
          type="text"
          placeholder="..."
          autocomplete="off"
        ></b-form-input>
        <div class="input-group-append" v-if="showCalendar">
          <DatepickerButton
            size="sm"
            locale="en-US"
            :min="minDate"
            :max="maxDate"
            v-model="endValueCalendar"
            required
            button-variant="outline-secondary"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Daterange from '@/models/Daterange'
import DatepickerButton from '@/components/base/DatepickerButton.vue'

export default {
  name: 'FilterDateRangeCalendar',
  components: {
    DatepickerButton,
  },
  props: {
    filters: {
      type: Array,
      default: () => [],
    },
    minDate: { type: Date, required: true },
    maxDate: { type: Date, required: true },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    showCalendar: { type: Boolean, default: true },
  },
  computed: {
    /**
     * This computed properties returns the date range based on the startValue and endValue properties.
     * If both startValue and endValue are valid dates, it returns a new Daterange object with the start and end dates.
     * If either startValue or endValue is not a valid date, it returns null.
     *
     * @returns {Daterange|null} The computed date range or null if the startValue or endValue is not a valid date.
     */
    computedDaterange() {
      const startDateFromValue = new Date(this.startValue)
      const endDateFromValue = new Date(this.endValue)
      if (!isNaN(startDateFromValue) && !isNaN(endDateFromValue)) {
        return new Daterange({ start: startDateFromValue, end: endDateFromValue })
      }
      return null
    },
    hasChanged() {
      return this.initialValue !== this.startValue + '-TO-' + this.endValue
    },
    values() {
      return [this.hasChanged, this.computedDaterange]
    },
    initialDates() {
      return [this.startDate, this.endDate]
    },
  },
  data() {
    return {
      startValue: '',
      startValueInput: '',
      startValueCalendar: '',
      endValue: '',
      endValueInput: '',
      endValueCalendar: '',
      initialValue: '',
    }
  },
  watch: {
    startValueInput(value) {
      this.startValue = value
      this.startValueCalendar = value
    },
    startValueCalendar(value) {
      this.startValue = value
      this.startValueInput = value
    },
    endValueInput(value) {
      this.endValue = value
      this.endValueCalendar = value
    },
    endValueCalendar(value) {
      this.endValue = value
      this.endValueInput = value
    },
    values([hasChanged, daterange]) {
      if (hasChanged && daterange) {
        console.info(
          '[FilterDateRangeCalendar] @changed:hasChanged',
          '\n - daterange:',
          daterange.getValue(),
        )
        this.$emit('changed', {
          item: {
            start: daterange.start,
            end: daterange.end,
          },
          q: daterange.getValue(),
        })
      }
    },
    initialDates: {
      handler([start, end]) {
        if (this.startValue.length > 0 || this.endValue.length > 0) {
          return
        }
        console.log('[FilterDateRangeCalendar] initialDate changed', start, end)
        if (start instanceof Date) {
          this.startValue = start.toISOString().split('T')[0]
          this.startValueInput = String(this.startValue)
          this.startValueCalendar = String(this.startValue)
        }
        if (end instanceof Date) {
          this.endValue = end.toISOString().split('T')[0]
          this.endValueInput = String(this.endValue)
          this.endValueCalendar = String(this.endValue)
        }
        // update the initial value
        this.initialValue = this.startValue + '-TO-' + this.endValue
      },
      immediate: true,
    },
  },
}
</script>
<i18n lang="json">
  {
    "en": {
      "label": {
        "timeline": {
          "passages": "Number of passages per year",
          "articles": "publication date",
          "images": "publication date"
        },
        "timelineDescription": {
          "passages": {
            "description": {
              "sum": "Number of text reuse passages per year",
              "percent": "Percentage of passages per year"
            },
            "filtered": {
              "sum": "Number of passages per year (filtered)",
              "percent": "Percentage of passages per year (filtered)"
            }
          },
          "articles": {
            "description": {
              "sum": "Number of articles per year",
              "percent": "Percentage of articles per year"
            },
            "filtered": {
              "sum": "Number of articles per year (filtered)",
              "percent": "Percentage of articles per year (filtered)"
            }
          },
          "images": {
            "description": {
              "sum": "Number of images extracted per year",
              "percent": "Percentage of number of images per year"
            },
            "filtered": {
              "sum": "Number of images per year (filtered)",
              "percent": "Percentage of number of images per year (filtered)"
            }
          }
        },
        "display": {
          "sum": "sum",
          "percent": "%"
        },
        "daterange": {
          "title": "publication date",
          "pick": "add new date filter ...",
          "start": "from",
          "end": "to",
          "apply": "add as filter"
        }
      }
    }
  }
  </i18n>
