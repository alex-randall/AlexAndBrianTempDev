// zSPRedirectBanner.js 1.0.0
//
// This is the JavaScript source code of the SPRedirectBanner 
// for SharePoint 2010 (or higher) which shows up on every page on 
// of the deployed root site/sub site/web. There are no other
// JavaScript dependencies.

// wrap this UserCustomAction logic in a uniquly named global function so it can
// participate in SharePoint 2013 (or higher) Minimal Download Strategy (MDS) if 
// present and not contaminate the global JavaScript namespace as much.
function a51809AEB50664F308FC56351C06FADB3() {
    
    // declare some internal constants/local variables/caches
    var redirectTimeInSeconds = 30;
    var newUrl = "[newUrl]"; // this value get set automatically at PowerShell deploy time
    var divElementToInsertId = "SPRedirectBanner";
    var secondsSSpanElementId = divElementToInsertId + "s"; // seconds
    var secondsNSpanElementId = divElementToInsertId + "n"; // number
    var autoRedirectDivElementId = divElementToInsertId + "a"; // autoredirect div
    var hrefElementId = divElementToInsertId + "h"; // href
    var messageHtml = 
        '<div>ACTION REQUIRED: This site has moved! Update your favorites/bookmarks immediately to:</div>' +
        '<div><a id="' + hrefElementId + '" href="' + newUrl + '">' + newUrl + '</a></div>' + 
        '<div id="' + autoRedirectDivElementId + '">auto-redirecting in ' +
        '<span id="' + secondsNSpanElementId + '">' + redirectTimeInSeconds.toString() + '</span> ' +
        'second<span id="' + secondsSSpanElementId + '">s</span>...</div>';
    var cachedWindowObject = window;
    var cachedDocumentObject = document;
    var timerInstance;
    var secondsSSpanElement;
    var secondsNSpanElement;
    var secondsCount = redirectTimeInSeconds;

    /**
     * Internal helper function that adds a css rule to the selected stylesheet.
     * This is a JavaScript way of adding inline custom styles to a page.
     * We are doing this so we don't have to have an external CSS file as well 
     * as provide hosting for it.
     */
    function addCSSRule(sheet, selector, rules, index) {
	    if("insertRule" in sheet) {
		    sheet.insertRule(selector + "{" + rules + "}", index);
	    }
	    else if("addRule" in sheet) {
		    sheet.addRule(selector, rules, index);
	    }
    
    }

    /**
     * Internal helper function that "blanks out" (a.k.a turns white and displays no content) 
     * the entire current SharePoint page while the new page is being redirected to 
     * indicate visually to the end user that the redirect is taking place. 
     */
    function blankScreen() {
        cachedDocumentObject.getElementsByTagName("body")[0].style.display = "none";
        return true;
    }

    /**
     * Internal helper function that is called on the JavaScript timer (once every second)
     * and decrements the timer and also performs the redirect when the timer ends.
     */
    function rewriteSecondsAndRedirectIfTimeout() {
         secondsCount--;
         if (secondsCount == 0) {
             // we are done
             // stop the timer
             clearInterval(timerInstance);

             // blank the screen
             blankScreen();

             // redirect to new url
             location.href = newUrl;
         } else {
             // show new seconds value...
             secondsNSpanElement.innerHTML = secondsCount.toString();

             // hide the "s" in seconds if there's only 1 second left
             // for proper english
             if (secondsCount == 1) {
                 secondsSSpanElement.style.display = "none";
             }
         }
    }

    /**
     * Internal helper function that is executed when the browser's Document 
     * Object Model (DOM) has loaded.
     * This is where the "main logic" of this customization really starts.
     */
    function domLoaded() {
        // the browser Document Object Model (DOM) has loaded!
        var divElementToInsert = cachedDocumentObject.getElementById(divElementToInsertId); 
        if (divElementToInsert) {
        } else {
            // haven't added it yet
            // find SharePoint's s4-workspace div... 
            var s4WorkspaceDivElement = cachedDocumentObject.getElementById("s4-workspace");
            if (s4WorkspaceDivElement) {
                // found it
                var sheet = cachedDocumentObject.styleSheets[0];
                
                // add css rule for main div
                addCSSRule(sheet, "#" + divElementToInsertId, "width:100%;background-color:#800000;color:white;font-weight:bold;padding:20px;font-size:18px");
                
                // add css rule for child divs
                addCSSRule(sheet, "#" + divElementToInsertId + ">div", "margin-bottom:10px");

                // add css rule for auto-redirect div
                addCSSRule(sheet, "#" + autoRedirectDivElementId, "font-size:14px;font-style:italic;font-weight:normal");

                // add css rule for a elements
                var aelementsCssRule = "color:white;font-weight:bold;text-decoration:underline";
                addCSSRule(sheet, "#" + divElementToInsertId + ' a:link',  aelementsCssRule);
                addCSSRule(sheet, "#" + divElementToInsertId + ' a:visited',  aelementsCssRule);
                addCSSRule(sheet, "#" + divElementToInsertId + ' a:hover',  aelementsCssRule);
                
                // now construct the divElementToInsert
                var divElementToInsert = cachedDocumentObject.createElement("div");
                divElementToInsert.id = divElementToInsertId;
                divElementToInsert.innerHTML = messageHtml;
                
                // insert the divElementToInsert as the first child of SharePoint's s4-workspace div
                s4WorkspaceDivElement.insertBefore(divElementToInsert, s4WorkspaceDivElement.childNodes[0]);

                // wire up the blankScreen() function to the "click"" event of the href 
                // in a cross-browser friendly way
                var hrefElement = cachedDocumentObject.getElementById(hrefElementId);
                if (hrefElement) {
                    try {
                        hrefElement.attachEvent(
                            "onclick", //For IE
                            blankScreen
                        );
                    } catch(e) {
                        try {
                            hrefElement.addEventListener(
                                "click", //For Mozilla-based browsers
                                blankScreen,
                                false);
                        }
                        catch (ex) {

                        }
                    }
                }

                // get the __ seconds remaining span element (the number)
                secondsNSpanElement = cachedDocumentObject.getElementById(secondsNSpanElementId);

                // get the second_ remaining span element (the s)
                secondsSSpanElement = cachedDocumentObject.getElementById(secondsSSpanElementId);

                // ensure we found those elements in the DOM
                if (secondsNSpanElement && secondsSSpanElement) {

                    // found them
                    // start the JavaScript timer to do the countdown each second (1 second = 1000 milliseconds)!
                    timerInstance = setInterval(rewriteSecondsAndRedirectIfTimeout, 1000);
                }
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
    // Standards-based browsers support DOMContentLoaded
    if ( cachedDocumentObject.addEventListener ) {

        // Use the handy event callback
        cachedDocumentObject.addEventListener( "DOMContentLoaded", detachEventsAndCallDomLoaded );

        // A fallback to window.onload, that will always work
        cachedDocumentObject.addEventListener( "load", detachEventsAndCallDomLoaded );

    // If IE event model is used
    } else {

        // Ensure firing before onload, maybe late but safe also for iframes
        cachedDocumentObject.attachEvent( "onreadystatechange", detachEventsAndCallDomLoaded );

        // A fallback to window.onload, that will always work
        window.attachEvent( "onload", detachEventsAndCallDomLoaded );
    }
}

// implement SharePoint 2013 (or higher) Minimal Download Strategy participation code
// This code derived from
// https://msdn.microsoft.com/EN-US/library/office/dn913116.aspx
// Is MDS enabled?
if ("undefined" !== typeof g_MinimalDownload && 
    g_MinimalDownload && 
    (window.location.pathname.toLowerCase()).indexOf("/_layouts/15/start.aspx")  !== -1 && 
    "undefined" !== typeof asyncDeltaManager) {
    // Register script for MDS if possible
    RegisterModuleInit("a51809AEB50664F308FC56351C06FADB3.js", a51809AEB50664F308FC56351C06FADB3); //MDS registration
    a51809AEB50664F308FC56351C06FADB3(); //non MDS run
} else {
    a51809AEB50664F308FC56351C06FADB3();
}