module Timeline { export var html = '<div>    <style>    #timeline {        position:absolute;bottom:0;height:100px;width:100%;background: white    }     #focustimeContainer {    width: 150px;    cursor: e-resize;height: 50px;background: #444;right: 200px;bottom: 80px;    color: white;position: absolute;    z-index: 1000;/* float: right; */display: block;}    </style>    <div>        <div id="timelinecontainer">            <div id="timeline"></div>                    </div>        <div class="callout top" id="focustimeContainer">            <div style="text-align: center">                <span style="font-weight: bold">{{vm.focusDate | date:"MM/dd/yyyy"}}</span><br />                <span>{{vm.focusDate | date:"h:mma"}}</span>            </div>        </div>    </div></div>'; }