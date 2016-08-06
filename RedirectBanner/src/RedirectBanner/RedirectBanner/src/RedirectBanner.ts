// RedirectBanner.ts
//
// a TypeScript source code file that once compiled, implements the tiny JavaScript
// code that once is minified, is injected into a SharePoint sub site 
// via the various deployers (via a SharePoint web-based UserCustomAction).  This has 
// the end user effect of the redirect banner showing up on every single SharePoint 
// page of the SharePoint root site/subsite it is deployed to.  NOTE: there are no 
// other CSS/JavaScript dependencies other than it running on a SharePoint page

// preliminary TypeScript definition stuff: 
// add function definitions to the StyleSheet DOM element since TypeScript doesn't implement them 
interface StyleSheet {
    addRule: (selector: string, rules: string) => void;
    insertRule: (selectorAndRules: string) => void;
}

// preliminary TypeScript definition stuff: 
// add function definition to the anchor (a) DOM element since TypeScript doesn't implement it 
interface HTMLAnchorElement {
    attachEvent: (eventName: string, functionToExecute: () => void) => void;
}

// preliminary TypeScript definition stuff: 
// add function definitions to the document DOM element since TypeScript doesn't implement it 
interface Document {
    attachEvent: (eventName: string, functionToExecute: () => void) => void;
    detachEvent: (eventName: string, functionToExecute: () => void) => void;
}

// preliminary TypeScript definition stuff: 
// add function definitions to the window DOM element since TypeScript doesn't implement it 
interface Window {
    attachEvent: (eventName: string, functionToExecute: () => void) => void;
    detachEvent: (eventName: string, functionToExecute: () => void) => void;
}

// preliminary TypeScript definition stuff:
// add SharePoint 2013 and higher Minimal Download Strategy variables and functions that may 
// or may not be present in the SharePoint page 
declare var g_MinimalDownload: boolean;
declare var asyncDeltaManager: any;
declare var RegisterModuleInit: (fileName: string, functionToExecute: () => void) => void;

// wrap this UserCustomAction logic in a uniquly named global function so it can
// participate in SharePoint 2013 (or higher) Minimal Download Strategy (MDS) if 
// present and not contaminate the global JavaScript namespace as much.
// if running in SharePoint 2010 (where no MDS is present), this pattern works as well.
function a51809AEB50664F308FC56351C06FADB3() : void {

    // the values in square brackets [] are set automatically at deploy time by the Deployer
    const redirectTimeInSeconds: number = <any>"[REDIRECT_TIME_IN_SECONDS]";
    const urlToRedirectTo: string = "[URL_TO_REDIRECT_TO]";
    const innerHtmlToInjectToInjectedDiv = "[INNER_HTML]";

    // define other constants and private variables
    const divElementToInsertId: string = "SPRedirectBanner";
    const autoRedirectSecondsSpanElementId: string = "SPRedirectBannerAutoRedirectSecondsSpan";
    const hrefElementId: string = "SPRedirectBannerHref";
    let cachedWindowObject = window;
    let cachedDocumentObject = document;
    let timerInstance: number;
    let secondsCount = redirectTimeInSeconds;

    /**
     * Internal helper function that adds a css rule to the selected stylesheet.
     * This is a JavaScript way of adding inline custom styles to a page.
     * We are doing this so we don't have to have an external CSS file as well 
     * as provide hosting for it.
     */
    function addCSSRule(sheet : StyleSheet, selector: string, rules: string) : void {
	    if("insertRule" in sheet) {
		    sheet.insertRule(selector + "{" + rules + "}");
	    } else if ("addRule" in sheet) {
		    sheet.addRule(selector, rules);
	    }
    }

    /**
     * Internal helper function that "blanks out" (a.k.a turns white and displays no content) 
     * the entire current SharePoint page while the new page is being redirected to 
     * indicate visually to the end user that the redirect is taking place. 
     */
    function blankScreen() : Boolean {
        cachedDocumentObject.getElementsByTagName("body")[0].style.display = "none";
        return true;
    }

    /**
     * Internal helper function that is called on the JavaScript timer (once every second)
     * and decrements the timer and also performs the redirect when the timer ends.
     */
    function rewriteSecondsAndRedirectIfTimeout(): void {
         secondsCount--;
         if (secondsCount == 0) {
             // we are done
             // stop the timer
             clearInterval(timerInstance);

             // blank the screen
             // blankScreen();

             // redirect to new url
            // location.href = newUrl;
         } else {
             // show new seconds value...
             // secondsNSpanElement.innerHTML = secondsCount.toString();

             // hide the "s" in seconds if there's only 1 second left
             // for proper english
             // if (secondsCount == 1) {
             //    secondsSSpanElement.style.display = "none";
             // }
         }
    }

    /**
     * Internal helper function that is executed when the browser's Document 
     * Object Model (DOM) has loaded.
     * This is where the "main logic" of this customization really starts.
     */
    function domLoaded() {
        // the browser Document Object Model (DOM) has loaded!
        let divElementToInsert = cachedDocumentObject.getElementById(divElementToInsertId);
        if (divElementToInsert) {
            // do nothing, our custom div has already been inserted, this is a side effect of Minimal Download Strategy sometimes
        } else {
            // haven't added it yet
            // find SharePoint's s4-workspace div... 
            let s4WorkspaceDivElement = cachedDocumentObject.getElementById("s4-workspace");
            if (s4WorkspaceDivElement) {
                // found it
                let sheet = cachedDocumentObject.styleSheets[0];

                // add css rule for main div
                addCSSRule(sheet, "#" + divElementToInsertId, "width:100%;background-color:#800000;color:white;font-weight:bold;padding:20px;font-size:18px");

                // add css rule for child divs
                addCSSRule(sheet, "#" + divElementToInsertId + ">div", "margin-bottom:10px");

                // add css rule for auto-redirect div
                ////addCSSRule(sheet, "#" + autoRedirectDivElementId, "font-size:14px;font-style:italic;font-weight:normal");

                // add css rule for a elements
                let aelementsCssRule = "color:white;font-weight:bold;text-decoration:underline";
                addCSSRule(sheet, "#" + divElementToInsertId + ' a:link',  aelementsCssRule);
                addCSSRule(sheet, "#" + divElementToInsertId + ' a:visited',  aelementsCssRule);
                addCSSRule(sheet, "#" + divElementToInsertId + ' a:hover',  aelementsCssRule);

                // now construct the divElementToInsert
                let divElementToInsert = cachedDocumentObject.createElement("div");
                divElementToInsert.id = divElementToInsertId;
                divElementToInsert.innerHTML = innerHtmlToInjectToInjectedDiv;

                // insert the divElementToInsert as the first child of SharePoint's s4-workspace div
                s4WorkspaceDivElement.insertBefore(divElementToInsert, s4WorkspaceDivElement.childNodes[0]);

                // wire up the blankScreen() function to the "click"" event of the href 
                // in a cross-browser friendly way
                let hrefElement = <HTMLAnchorElement>cachedDocumentObject.getElementById(hrefElementId);
                if (hrefElement) {
                    try {
                        hrefElement.attachEvent(
                            "onclick", // for IE
                            blankScreen
                        );
                    } catch(e) {
                        try {
                            hrefElement.addEventListener(
                                "click", // for Mozilla-based browsers
                                blankScreen,
                                false);
                        } catch (ex) {
                            // suppress any errors that happen
                        }
                    }
                }

                // get the __ seconds remaining span element (the number)
                ////secondsNSpanElement = cachedDocumentObject.getElementById(secondsNSpanElementId);

                // get the second_ remaining span element (the s)
                ////secondsSSpanElement = cachedDocumentObject.getElementById(secondsSSpanElementId);

                // ensure we found those elements in the DOM
                ////if (secondsNSpanElement && secondsSSpanElement) {

                    // found them
                    // start the JavaScript timer to do the countdown each second (1 second = 1000 milliseconds)!
                    ////timerInstance = setInterval(rewriteSecondsAndRedirectIfTimeout, 1000);
                ////}
            }
        }
    }

    /**
     * Internal helper function that detaches any events that were attached previously in 
     * relation to dom loaded and then calls our internal domLoaded() function when complete
     */
    function detachEventsAndCallDomLoaded() {
        if ( cachedDocumentObject.addEventListener ) {
		    cachedDocumentObject.removeEventListener( "DOMContentLoaded", detachEventsAndCallDomLoaded );
		    cachedWindowObject.removeEventListener( "load", detachEventsAndCallDomLoaded );
    	} else {
	    	cachedDocumentObject.detachEvent( "onreadystatechange", detachEventsAndCallDomLoaded );
		    cachedWindowObject.detachEvent( "onload", detachEventsAndCallDomLoaded );
	    }

        domLoaded();
    }

    // start of immediate script load logic:
    // wait until dom loaded...
    // standards-based browsers support DOMContentLoaded
    if ( cachedDocumentObject.addEventListener ) {

        // use the handy event callback
        cachedDocumentObject.addEventListener( "DOMContentLoaded", detachEventsAndCallDomLoaded );

        // a fallback to window.onload, that will always work
        cachedDocumentObject.addEventListener( "load", detachEventsAndCallDomLoaded );

    // if IE event model is used
    } else {

        // ensure firing before onload, maybe late but safe also for iframes
        cachedDocumentObject.attachEvent( "onreadystatechange", detachEventsAndCallDomLoaded );

        // a fallback to window.onload, that will always work
        window.attachEvent( "onload", detachEventsAndCallDomLoaded );
    }
}

// implement SharePoint 2013 (or higher) Minimal Download Strategy participation code
// this code derived from
// https://msdn.microsoft.com/EN-US/library/office/dn913116.aspx
// is MDS enabled?
if ("undefined" !== typeof g_MinimalDownload && 
    g_MinimalDownload && 
    (window.location.pathname.toLowerCase()).indexOf("/_layouts/15/start.aspx")  !== -1 && 
    "undefined" !== typeof asyncDeltaManager) {
    // register script for MDS if possible
    RegisterModuleInit("a51809AEB50664F308FC56351C06FADB3.js", a51809AEB50664F308FC56351C06FADB3); // do MDS registration
    a51809AEB50664F308FC56351C06FADB3(); // non MDS run
} else {
    a51809AEB50664F308FC56351C06FADB3();
}