import aeonix from "#root/index.js";
import Serializable, { baseFields, defineField } from "./serializable.js";

type RawTime = {
  currentTime: number;
  currentDay: number;
  currentMonth: number;
  currentYear: number;
};

const v1 = defineField(baseFields, {
  add: {
    currentTime: { id: 0, type: Number },
    currentDay: { id: 1, type: Number },
    currentMonth: { id: 2, type: Number },
    currentYear: { id: 3, type: Number },
  },
});

export default class Time extends Serializable<RawTime> {
  static override fields = [v1];
  static override migrators = [];

  currentTime: number;
  currentDay: number;
  currentMonth: number;
  currentYear: number;

  constructor(
    currentTime: number,
    currentDay: number,
    currentMonth: number,
    currentYear: number
  ) {
    super();
    this.currentTime = currentTime;
    this.currentDay = currentDay;
    this.currentMonth = currentMonth;
    this.currentYear = currentYear;
  }

  addTime(time: number) {
    this.currentTime += time;
    while (this.currentTime > 24) {
      this.currentTime -= 24;
      this.addDays(1);
    }
  }

  addDays(days: number) {
    this.currentDay += days;
    while (this.currentDay > 30) {
      this.currentDay -= 30;
      this.addMonths(1);
    }
  }

  addMonths(months: number) {
    this.currentMonth += months;
    while (this.currentMonth > 12) {
      this.currentMonth -= 12;
      this.addYears(1);
    }
  }

  addYears(years: number) {
    this.currentYear += years;
  }

  static now() {
    return new Time(
      aeonix.time.currentTime,
      aeonix.time.currentDay,
      aeonix.time.currentMonth,
      aeonix.time.currentYear
    );
  }

  timeDiff(time: Time) {
    // begin with years
    let diff = (this.currentYear - time.currentYear) * 365 * 24;

    // add months
    diff += (this.currentMonth - time.currentMonth) * 30 * 24;

    // add days
    diff += (this.currentDay - time.currentDay) * 24;

    // add hours
    diff += this.currentTime - time.currentTime;
    return diff;
  }

  clone() {
    return new Time(
      this.currentTime,
      this.currentDay,
      this.currentMonth,
      this.currentYear
    );
  }
}
