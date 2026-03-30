import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

const SDK_SCRIPT = `(function(){
  if(window===window.top)return;
  function sendUrl(){
    window.parent.postMessage({type:"prevuiw:url",url:location.href},"*");
  }
  function sendScroll(){
    window.parent.postMessage({
      type:"prevuiw:scroll",
      scrollX:window.scrollX,
      scrollY:window.scrollY,
      scrollWidth:document.documentElement.scrollWidth,
      scrollHeight:document.documentElement.scrollHeight,
      clientWidth:document.documentElement.clientWidth,
      clientHeight:document.documentElement.clientHeight
    },"*");
  }
  sendUrl();
  sendScroll();
  window.addEventListener("scroll",sendScroll);
  window.addEventListener("resize",sendScroll);
  window.addEventListener("hashchange",sendUrl);
  var p=history.pushState,r=history.replaceState;
  history.pushState=function(){p.apply(this,arguments);sendUrl();sendScroll()};
  history.replaceState=function(){r.apply(this,arguments);sendUrl();sendScroll()};
})();`;

@Controller()
export class SdkController {
  @Get('sdk.js')
  serve(@Res() res: Response) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(SDK_SCRIPT);
  }
}
