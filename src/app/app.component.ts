import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  VERSION,
  ViewChild
} from "@angular/core";
import { interval } from "rxjs";
import { map } from "rxjs/operators";

export interface GanttChartData {
  ghostBar?: GanttChartBar;
  actualBar?: GanttChartBar;
  data?: any;
}

export interface GanttChartBar {
  xPos?: number;
  width?: number;
  progress?: number;
  completed?: number;
}

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements AfterViewInit, OnDestroy {
  name = "Angular " + VERSION.major;

  @ViewChild("ganttChartContainer") ganttChartContainer;

  public startTime;
  public endTime;
  public currentTime = new Date();
  public timeArr = [];
  public zoom = 10;
  public timeRange = 6 * 60;
  public ganttChartData = [];
  public counter;

  public schedule = [
    {
      flightType: "TAF",
      arrivalFlightNo: "SI123",
      orgin: "BOM",
      sta: new Date("10/28/2020 08:00:00"),
      eta: new Date("10/28/2020 08:15:00"),
      ata: new Date("10/28/2020 08:15:00"),
      departureFlighNo: "SI124",
      destination: "BOM",
      std: new Date("10/28/2020 09:00:00"),
      etd: new Date("10/28/2020 09:15:00"),
      atd: new Date("10/28/2020 09:15:00"),
      groundTime: 60,
      status: "COMPLETED"
    },
    {
      flightType: "TAF",
      arrivalFlightNo: "SI125",
      orgin: "BOM",
      sta: new Date("10/28/2020 08:30:00"),
      eta: new Date("10/28/2020 08:45:00"),
      ata: new Date("10/28/2020 08:45:00"),
      departureFlighNo: "SI126",
      destination: "HYD",
      std: new Date("10/28/2020 09:45:00"),
      etd: new Date("10/28/2020 09:45:00"),
      // atd: new Date("10/28/2020 10:45:00"),
      groundTime: 60,
      status: "IN PROGRESS"
    },
    {
      flightType: "TAF",
      arrivalFlightNo: "SI127",
      orgin: "DEL",
      sta: new Date("10/28/2020 09:00:00"),
      eta: new Date("10/28/2020 09:10:00"),
      ata: new Date("10/28/2020 09:10:00"),
      departureFlighNo: "SI128",
      destination: "BOM",
      std: new Date("10/28/2020 10:00:00"),
      etd: new Date("10/28/2020 10:10:00"),
      // atd: new Date("10/28/2020 15:30:00"),
      groundTime: 60,
      status: "IN PROGRESS"
    },
    {
      flightType: "AF",
      arrivalFlightNo: "SI129",
      orgin: "BOM",
      sta: new Date("10/28/2020 09:52:00"),
      eta: new Date("10/28/2020 10:05:00"),
      // ata: new Date('10/28/2020 10:32:00'),
      groundTime: 60,
      status: "IN PROGRESS"
    },
    {
      flightType: "BF",
      departureFlighNo: "SI130",
      destination: "TRV",
      std: new Date("10/28/2020 10:30:00"),
      etd: new Date("10/28/2020 11:40:00"),
      // atd: new Date('10/28/2020 12:15:00'),
      groundTime: 60,
      status: "IN PROGRESS"
    }
  ];

  constructor() {
    this.configureGantChart();
  }

  configureGantChart() {
    this.timeArr = [];
    this.currentTime = new Date();
    this.currentTime.setSeconds(0);

    let updatedCurrentTime = new Date(this.currentTime);
    updatedCurrentTime.setMinutes(
      updatedCurrentTime.getMinutes() -
        (updatedCurrentTime.getMinutes() % this.zoom)
    );
    this.startTime = new Date(
      updatedCurrentTime.getTime() - this.timeRange * 60 * 1000
    );
    this.endTime = new Date(
      updatedCurrentTime.getTime() + this.timeRange * 60 * 1000
    );

    let newTime = this.startTime;

    this.timeArr.push(newTime);
    while (newTime < this.endTime) {
      newTime = new Date(newTime.getTime() + this.zoom * 60 * 1000);
      this.timeArr.push(newTime);
    }
  }

  ngAfterViewInit(): void {
    this.centerCurrentTime();
    this.counter = interval(5000).subscribe(x => {
      console.log("isRunning");
      this.configureGantChart();
      this.centerCurrentTime();
    });
  }

  ngOnDestroy(): void {
    this.counter.unsubscribe();
  }

  centerCurrentTime() {
    const ganttChartElm = this.ganttChartContainer
      .nativeElement as HTMLDivElement;
    ganttChartElm.scrollLeft =
      this.diffMinutes(this.currentTime, this.startTime) -
      ganttChartElm.clientWidth / 2 +
      200;
  }

  diffMinutes(dt2, dt1): number {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.round(diff) * (24 / this.zoom);
  }

  getSTPostion(task) {
    let positionTime;
    if (task.flightType === "TAF" || task.flightType === "AF") {
      positionTime = task.sta;
    } else {
      positionTime = new Date(task.std.getTime() - task.groundTime * 60 * 1000);
    }
    return this.diffMinutes(positionTime, this.startTime);
  }

  getSTWidth(task) {
    let startTime, endTime;
    if (task.flightType === "TAF") {
      startTime = task.sta;
      endTime = task.std;
    } else if (task.flightType === "AF") {
      startTime = task.sta;
      endTime = new Date(task.sta.getTime() + task.groundTime * 60 * 1000);
    } else {
      startTime = new Date(task.std.getTime() - task.groundTime * 60 * 1000);
      endTime = task.std;
    }
    return this.diffMinutes(endTime, startTime);
  }

  getETPostion(task) {
    let positionTime;
    if (task.flightType === "TAF" || task.flightType === "AF") {
      positionTime = task.ata ? task.ata : task.eta;
    } else {
      let time = task.atd ? task.atd : task.etd;
      positionTime = new Date(time.getTime() - task.groundTime * 60 * 1000);
    }
    return this.diffMinutes(positionTime, this.startTime);
  }

  getETWidth(task) {
    let startTime, endTime;
    if (task.flightType === "TAF") {
      startTime = task.ata ? task.ata : task.eta;
      endTime = task.atd ? task.atd : task.etd;
    } else if (task.flightType === "AF") {
      startTime = task.ata ? task.ata : task.eta;
      endTime = new Date(startTime.getTime() + task.groundTime * 60 * 1000);
    } else {
      endTime = task.atd ? task.atd : task.etd;
      startTime = new Date(endTime.getTime() - task.groundTime * 60 * 1000);
    }
    if (task.status !== "COMPLETED") {
      if (endTime < this.currentTime) {
        endTime = new Date(this.currentTime.getTime() + this.zoom * 60 * 1000);
      }
    }
    return this.diffMinutes(endTime, startTime);
  }

  getSTStartingTime(task) {
    if (task.flightType === "TAF" || task.flightType === "AF") {
      return task.sta;
    } else {
      return new Date(task.std.getTime() - task.groundTime * 60 * 1000);
    }
  }

  getSTEndTime(task) {
    if (task.flightType === "TAF" || task.flightType === "BF") {
      return task.std;
    } else {
      return new Date(task.sta.getTime() + task.groundTime * 60 * 1000);
    }
  }

  getETStartingTime(task) {
    if (task.flightType === "TAF" || task.flightType === "AF") {
      return task.ata ? task.ata : task.eta;
    } else {
      const depTime = task.atd ? task.atd : task.etd;
      return new Date(depTime.getTime() - task.groundTime * 60 * 1000);
    }
  }

  getETEndTime(task) {
    if (task.flightType === "TAF" || task.flightType === "BF") {
      return task.atd ? task.atd : task.etd;
    } else {
      const arrTime = task.ata ? task.ata : task.eta;
      return new Date(arrTime.getTime() + task.groundTime * 60 * 1000);
    }
  }

  getProgress(task) {
    let startTime, endTime;
    if (task.flightType === "TAF") {
      startTime = task.ata ? task.ata : task.eta;
      endTime = task.atd ? task.atd : this.currentTime;
    } else if (task.flightType === "AF") {
      startTime = task.ata ? task.ata : task.eta;
      endTime = new Date(startTime.getTime() + task.groundTime * 60 * 1000);
      endTime =
        endTime > this.currentTime
          ? this.currentTime
          : endTime < this.currentTime
          ? this.currentTime
          : endTime;
    } else {
      endTime = task.atd ? task.atd : task.etd;
      startTime = new Date(endTime.getTime() - task.groundTime * 60 * 1000);
      endTime =
        endTime > this.currentTime
          ? this.currentTime
          : endTime < this.currentTime
          ? this.currentTime
          : endTime;
    }
    if (startTime > this.currentTime) return 0;
    return this.diffMinutes(endTime, startTime);
  }

  getProgressCompleted(task) {
    let startTime, endTime;
    if (task.flightType === "TAF") {
      startTime = task.ata ? task.ata : task.eta;
      endTime = task.atd ? task.atd : this.currentTime;
      if (!task.atd) {
        if (task.etd < this.currentTime) {
          endTime = new Date(task.etd);
        }
      }
    } else if (task.flightType === "AF") {
      startTime = task.ata ? task.ata : task.eta;
      endTime = new Date(startTime.getTime() + task.groundTime * 60 * 1000);
      endTime = endTime > this.currentTime ? this.currentTime : endTime;
    } else {
      endTime = task.atd ? task.atd : task.etd;
      startTime = new Date(endTime.getTime() - task.groundTime * 60 * 1000);
      endTime = endTime > this.currentTime ? this.currentTime : endTime;
    }
    if (startTime > this.currentTime) return 0;
    return this.diffMinutes(endTime, startTime);
  }
}
