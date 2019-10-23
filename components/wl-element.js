export class WlElement extends HTMLElement
{
    get wlApp() {
        const x = document.getElementsByTagName('wl-app')[0];
        return x;
    }
}