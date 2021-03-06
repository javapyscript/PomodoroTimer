import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef, ViewChild } from '@angular/core';
import * as moment from "moment";
import { LogtrackerService } from 'src/app/services/logtracker.service';
import { ModalDirective } from 'angular-bootstrap-md';


@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {

  pomodoro_minutes = 25;
  pause = false; //is timer paused
  reset = true;
  counter;
  currentDate:Date;
  deadLine:Date;
  interval:number;
  timeleft:string;

  @ViewChild('timerFinishModal', {static: true})
  timerFinishModal: ModalDirective;

  constructor(private cdref: ChangeDetectorRef, 
              private logTracker: LogtrackerService) { }

  ngOnInit() {
    if(localStorage.getItem('pomodoroSettings')!==null){
      let pomodoroSettings = JSON.parse(localStorage.getItem('pomodoroSettings'));
      this.pomodoro_minutes = pomodoroSettings.pomodoroTime;
    }
    window.onbeforeunload = ()=>this.resetTimer();
    this.resetTimer();
    this.logTracker.pomodoroTimeChange.subscribe(value=>{
      let pomodoroSettings = JSON.parse(localStorage.getItem('pomodoroSettings'));
      this.pomodoro_minutes = pomodoroSettings.pomodoroTime;
      this.resetTimer();
    });

  }

  startTimer(){
    
  
    if(this.pause){
      this.pause = false;
    }
    else if(this.reset){
      this.reset = false;
      this.logTracker.startTime = new Date();
      console.log(this.logTracker.startTime);
      this.counter = setInterval(()=>this.timer(), 1000);
    }
  }

  timer(){
    

    if (!this.pause) { 
      this.interval -= 1;
      this.currentDate = new Date(); //get current time
      
      this.deadLine = new Date(this.currentDate.getTime());
      this.deadLine.setSeconds(this.deadLine.getSeconds() + this.interval);
      let diff = this.deadLine.getTime() - this.currentDate.getTime();
      let totalSecs = Math.abs(diff/1000);
      if(totalSecs <=0){
        clearInterval(this.counter);
        let endTime = new Date();
        let pomodoroLog = [];
        if(localStorage.getItem('pomodoroLog') !== null){
          pomodoroLog = JSON.parse(localStorage.getItem('pomodoroLog'));
        }
        pomodoroLog.push({startTime: this.logTracker.startTime, endTime: endTime, description: ""});
        localStorage.setItem('pomodoroLog', JSON.stringify(pomodoroLog));
        let alarm = new Audio();
        alarm.src = "assets/sounds/alarm.mp3";
        alarm.load();
        alarm.play();
        this.timerFinishModal.show();


      }
      let minutes = Math.floor(totalSecs/60);
      let seconds = totalSecs - minutes*60;
      let formattedSeconds = ("0" + seconds).slice(-2);
      this.timeleft = minutes.toString() + ':' + formattedSeconds.toString();
    }
  }

  stopTimer(){
    this.pause = true;
  }

  resetTimer(){
    this.pause = false;
    this.reset = true;
    this.interval = 60 * this.pomodoro_minutes; //five minutes is 300 seconds!
    let totalSecs = this.interval;
    let minutes = Math.floor(totalSecs/60);
    let seconds = totalSecs - minutes*60;
    let formattedSeconds = ("0" + seconds).slice(-2);
    this.timeleft = minutes.toString() + ':' + formattedSeconds.toString();
    try{
      clearInterval(this.counter);
    }
    catch{

    }
    
  }

}


