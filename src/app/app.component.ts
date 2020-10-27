import {
  AfterViewInit,
  Component,
  ElementRef,
  VERSION,
  ViewChild
} from "@angular/core";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements AfterViewInit {
  name = "Angular " + VERSION.major;

  @ViewChild("ganttChartContainer") ganttChartContainer;

  public startTime;
  public endTime;
  public currentTime = new Date();
  public timeArr = [];
  public zoom = 10;
  public timeRange = 6 * 60;

  public schedule = [
    {
      flightType: "TAF",
      arrivalFlightNo: "SI123",
      orgin: "BOM",
      sta: new Date("10/27/2020 10:00:00"),
      eta: new Date("10/27/2020 10:15:00"),
      ata: new Date("10/27/2020 10:15:00"),
      departureFlighNo: "SI124",
      destination: "BOM",
      std: new Date("10/27/2020 11:00:00"),
      etd: new Date("10/27/2020 11:15:00"),
      atd: new Date("10/27/2020 11:15:00"),
      groundTime: 60
    },
    {
      flightType: "TAF",
      arrivalFlightNo: "SI125",
      orgin: "BOM",
      sta: new Date("10/27/2020 10:30:00"),
      eta: new Date("10/27/2020 10:45:00"),
      ata: new Date("10/27/2020 10:45:00"),
      departureFlighNo: "SI126",
      destination: "HYD",
      std: new Date("10/27/2020 11:45:00"),
      etd: new Date("10/27/2020 11:45:00"),
      atd: new Date("10/27/2020 11:45:00"),
      groundTime: 60
    },
    {
      flightType: "TAF",
      arrivalFlightNo: "SI127",
      orgin: "DEL",
      sta: new Date("10/27/2020 15:00:00"),
      eta: new Date("10/27/2020 16:00:00"),
      ata: new Date("10/27/2020 16:00:00"),
      departureFlighNo: "SI128",
      destination: "BOM",
      std: new Date("10/27/2020 16:30:00"),
      etd: new Date("10/27/2020 17:30:00"),
      // atd: new Date("10/27/2020 15:30:00"),
      groundTime: 60
    },
    {
      flightType: "AF",
      arrivalFlightNo: "SI129",
      orgin: "BOM",
      sta: new Date("10/27/2020 14:52:00"),
      eta: new Date("10/27/2020 16:12:00"),
      // ata: new Date('10/27/2020 10:32:00'),
      groundTime: 60
    },
    {
      flightType: "BF",
      departureFlighNo: "SI130",
      destination: "TRV",
      std: new Date("10/27/2020 16:30:00"),
      etd: new Date("10/27/2020 17:40:00"),
      // atd: new Date('10/27/2020 12:15:00'),
      groundTime: 60
    }
  ];

  public tasks = [
    {
      name: "Do things",
      category: "Óscar",
      from: new Date("10/26/2020 21:00:00"),
      to: new Date("10/27/2020 00:00:00"),
      comment: "Things never end"
    },
    {
      name: "More stuff",
      category: "Peter",
      from: new Date("10/26/2020 23:45:00"),
      to: new Date("10/27/2020 00:30:00"),
      comment: "Even more stuff"
    },
    {
      name: "Last but not least",
      category: "Johnny",
      from: new Date("10/27/2020 00:30:00"),
      to: new Date("10/27/2020 01:45:00"),
      comment: "Agggh"
    }
  ];

  constructor() {
    this.timeArr = [];
    console.log(this.currentTime.getMinutes() % this.zoom);

    this.currentTime.setSeconds(0);

    let updatedCurrentTime = new Date(this.currentTime);
    updatedCurrentTime.setMinutes(
      updatedCurrentTime.getMinutes() -
        (updatedCurrentTime.getMinutes() % this.zoom)
    );
    console.log(this.currentTime);
    this.startTime = new Date(
      updatedCurrentTime.getTime() - this.timeRange * 60 * 1000
    );
    this.endTime = new Date(
      updatedCurrentTime.getTime() + this.timeRange * 60 * 1000
    );
    console.log("startTime", this.startTime.toLocaleTimeString());
    console.log("endTime", this.endTime.toLocaleTimeString());

    let newTime = this.startTime;

    this.timeArr.push(newTime);
    while (newTime < this.endTime) {
      newTime = new Date(newTime.getTime() + this.zoom * 60 * 1000);
      this.timeArr.push(newTime);
    }

    // (this.ganttChartContainer
    //   .nativeElement as HTMLDivElement).scrollLeft = this.diff_minutes(
    //   this.currentTime,
    //   this.startTime
    // );
  }
  ngAfterViewInit(): void {
    this.centerCurrentTime();
    (this.ganttChartContainer.nativeElement as HTMLDivElement).addEventListener(
      "resize",
      () => {
        console.log("hi");
        this.centerCurrentTime();
      }
    );
  }

  centerCurrentTime() {
    (this.ganttChartContainer.nativeElement as HTMLDivElement).scrollLeft =
      this.diff_minutes(this.currentTime, this.startTime) -
      (this.ganttChartContainer.nativeElement as HTMLDivElement).clientWidth /
        2 +
      200;
  }

  diff_minutes(dt2, dt1): number {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.round(diff) * (24 / this.zoom);
  }

  getSTPostion(task) {
    if (task.flightType === "TAF" || task.flightType === "AF") {
      let diff = (task.sta.getTime() - this.startTime) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    } else {
      let bftime = new Date(task.std.getTime() - task.groundTime * 60 * 1000);
      let diff = (bftime.getTime() - this.startTime) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    }
  }

  getSTWidth(task) {
    if (task.flightType === "TAF") {
      let diff = (task.std.getTime() - task.sta.getTime()) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    } else if (task.flightType === "AF") {
      let aftime = new Date(task.sta.getTime() + task.groundTime * 60 * 1000);
      let diff = (aftime.getTime() - task.sta.getTime()) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    } else {
      let bftime = new Date(task.std.getTime() - task.groundTime * 60 * 1000);
      let diff = (task.std.getTime() - bftime.getTime()) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    }
  }

  getETPostion(task) {
    if (task.flightType === "TAF" || task.flightType === "AF") {
      let time = task.ata ? task.ata : task.eta;
      let diff = (time - this.startTime) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    } else {
      let time = task.atd ? task.atd : task.etd;
      let bftime = new Date(time.getTime() - task.groundTime * 60 * 1000);
      let diff = (bftime.getTime() - this.startTime) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    }
  }

  getETWidth(task) {
    if (task.flightType === "TAF") {
      const starTime = task.ata ? task.ata : task.eta;
      const endTime = task.atd ? task.atd : task.etd;
      if (!task.atd) {
      }
      let diff = (endTime.getTime() - starTime.getTime()) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    } else if (task.flightType === "AF") {
      const starTime = task.ata ? task.ata : task.eta;
      const endTime = new Date(
        starTime.getTime() + task.groundTime * 60 * 1000
      );
      let diff = (endTime.getTime() - starTime.getTime()) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    } else {
      const endTime = task.atd ? task.atd : task.etd;
      const starTime = new Date(
        endTime.getTime() - task.groundTime * 60 * 1000
      );
      let diff = (endTime.getTime() - starTime.getTime()) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    }
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
    if (task.flightType === "TAF") {
      const starTime = task.ata ? task.ata : task.eta;
      const endTime = task.atd ? task.atd : this.currentTime;
      if (starTime > this.currentTime) return 0;
      let diff = (endTime.getTime() - starTime.getTime()) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    } else if (task.flightType === "AF") {
      const starTime = task.ata ? task.ata : task.eta;
      let endTime = new Date(starTime.getTime() + task.groundTime * 60 * 1000);
      endTime = endTime > this.currentTime ? this.currentTime : endTime;
      if (starTime > this.currentTime) return 0;
      let diff = (endTime.getTime() - starTime.getTime()) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    } else {
      let endTime = task.atd ? task.atd : task.etd;
      const starTime = new Date(
        endTime.getTime() - task.groundTime * 60 * 1000
      );
      endTime = endTime > this.currentTime ? this.currentTime : endTime;
      if (starTime > this.currentTime) return 0;
      let diff = (endTime.getTime() - starTime.getTime()) / 1000;
      diff /= 60;
      return Math.round(diff) * (24 / this.zoom);
    }
  }

  getProgress2(task) {
    let startTime, endTime;
    if (task.flightType === "TAF") {
      startTime = task.ata ? task.ata : task.eta;
      endTime = task.atd ? task.atd : this.currentTime;
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
    let diff = (endTime.getTime() - startTime.getTime()) / 1000;
    diff /= 60;
    return Math.round(diff) * (24 / this.zoom);
  }
}
