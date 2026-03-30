import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { validateExternalUrl } from '@/common/utils/url-validator';

@Controller('proxy')
export class ProxyController {
  @Get()
  async proxy(@Query('url') url: string, @Res() res: Response) {
    if (!url) {
      throw new BadRequestException('url query parameter is required');
    }

    validateExternalUrl(url);

    const parsed = new URL(url);
    const baseHref = `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/[^/]*$/, '/')}`;

    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    const contentType = upstream.headers.get('content-type') || 'text/html';

    // Only proxy HTML documents
    if (!contentType.includes('text/html')) {
      throw new BadRequestException('Only HTML pages can be proxied');
    }

    let html = await upstream.text();

    // Inject <base> tag so relative URLs resolve against the original domain,
    // plus a script that reports URL changes to the parent frame
    const injected = `<base href="${baseHref}"><script>(function(){var o="${parsed.origin}";function s(){parent.postMessage({type:"prevuiw:url",url:location.href.replace(location.origin,o)},"*")}s();window.addEventListener("hashchange",s);var p=history.pushState,r=history.replaceState;history.pushState=function(){p.apply(this,arguments);s()};history.replaceState=function(){r.apply(this,arguments);s()};function sc(){parent.postMessage({type:"prevuiw:scroll",scrollX:window.scrollX,scrollY:window.scrollY,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,clientWidth:document.documentElement.clientWidth,clientHeight:document.documentElement.clientHeight},"*")}sc();window.addEventListener("scroll",sc);window.addEventListener("resize",sc)})()</script>`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${injected}`);
    } else if (html.includes('<HEAD>')) {
      html = html.replace('<HEAD>', `<HEAD>${injected}`);
    } else {
      html = injected + html;
    }

    // Strip headers that block iframe embedding
    res.setHeader('Content-Type', contentType);
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.send(html);
  }
}
