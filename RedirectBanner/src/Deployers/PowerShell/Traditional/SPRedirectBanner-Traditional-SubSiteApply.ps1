# SPRedirectBanner-Traditional-SubSiteApply.ps1 1.0.0
#
# A PowerShell script that (re)applies the SharePoint 2010 (or higher) 
# SPRedirectBanner customization to an existing single root site, sub site, or web.

Param(
  [Parameter(Mandatory=$True,Position=1)]
   [string]$webUrl,

   [Parameter(Mandatory=$True,Position=2)]
   [string]$newWebUrl,

   [Parameter(Mandatory=$false,Position=3)]
   [switch]$callingFromSiteCollectionScript
   
)

# force this script to stop immediately if an error occurs and display the error
$ErrorActionPreference = "Stop";

# BEGIN CONFIGURABLE SETTINGS
$redirectTimeInSeconds = 30;
$innerHtmlToInject = 'hello!';
$customActionSequenceNumber = 1000;
# END CONFIGURABLE SETTINGS

# print out header if not calling from site collection script
if (!$callingFromSiteCollectionScript) 
{
    Write-Host;
    Write-Host "(Re)applying SPRedirectBanner to...";
    Write-Host;
}

# get the SharePoint root site/sub site/web that was specified in the 
# required $webUrl script parameter
$web = Get-SPWeb $webUrl;

# indicate we are working on this web
Write-Host ($web.Url + "...") -ForegroundColor: Magenta;

# see if our user custom action already exists at the web level...
$userCustomActions = $web.UserCustomActions;
$ourUserCustomAction = $null;
foreach ($userCustomAction in $userCustomActions) {
    if ($userCustomAction.Name -eq "SPRedirectBanner") {
        $ourUserCustomAction = $userCustomAction;
        break;
    }
}

if ($ourUserCustomAction -eq $null) {
    # does not exist yet, go ahead and start to create it
    $ourUserCustomAction = $userCustomActions.Add();
    $ourUserCustomAction.Name = "SPRedirectBanner";
}

$ourUserCustomAction.Sequence = $customActionSequenceNumber;
$ourUserCustomAction.Location = "ScriptLink";

# the string below is the minified JavaScript code that is created from the RedirectBanner project
$scriptBlock = '/* BEGIN SPRedirectBanner 1.0.0 */function a51809AEB50664F308FC56351C06FADB3(){function e(e,t,n){"insertRule"in e?e.insertRule(t+"{"+n+"}"):"addRule"in e&&e.addRule(t,n)}function t(){return l.getElementsByTagName("body")[0].style.display="none",!0}function n(){var n=l.getElementById(o);if(n);else{var a=l.getElementById("s4-workspace");if(a){var r=l.styleSheets[0];e(r,"#"+o,"width:100%;background-color:#800000;color:white;font-weight:bold;padding:20px;font-size:18px"),e(r,"#"+o+">div","margin-bottom:10px");var c="color:white;font-weight:bold;text-decoration:underline";e(r,"#"+o+" a:link",c),e(r,"#"+o+" a:visited",c),e(r,"#"+o+" a:hover",c);var s=l.createElement("div");s.id=o,s.innerHTML=d,a.insertBefore(s,a.childNodes[0]);var v=l.getElementById(i);if(v)try{v.attachEvent("onclick",t)}catch(e){try{v.addEventListener("click",t,!1)}catch(e){}}}}}function a(){l.addEventListener?(l.removeEventListener("DOMContentLoaded",a),r.removeEventListener("load",a)):(l.detachEvent("onreadystatechange",a),r.detachEvent("onload",a)),n()}var d="[INNER_HTML]",o="SPRedirectBanner",i="SPRedirectBannerHref",r=window,l=document;l.addEventListener?(l.addEventListener("DOMContentLoaded",a),l.addEventListener("load",a)):(l.attachEvent("onreadystatechange",a),window.attachEvent("onload",a))}"undefined"!=typeof g_MinimalDownload&&g_MinimalDownload&&window.location.pathname.toLowerCase().indexOf("/_layouts/15/start.aspx")!==-1&&"undefined"!=typeof asyncDeltaManager?(RegisterModuleInit("a51809AEB50664F308FC56351C06FADB3.js",a51809AEB50664F308FC56351C06FADB3),a51809AEB50664F308FC56351C06FADB3()):a51809AEB50664F308FC56351C06FADB3();/* END SPRedirectBanner 1.0.0 */';

# ensure the minified JavaScript code ends with a semi-colon 
# (sometimes the minifer omits it, and causes SharePoint's 
# own JavaScript to stop working!)
if (!$scriptBlock.EndsWith(";")) 
{
    $scriptBlock = $scriptBlock + ";";
}

# construct the new web url with a possible slash at the end
$newWebUrlWithSlashAtEnd = $newWebUrl.TrimEnd('/');
if (!$newWebUrlWithSlashAtEnd.EndsWith(".aspx")) {
    $newWebUrlWithSlashAtEnd = $newWebUrl.TrimEnd('/') + "/";
}

# set the new url in the minified JavaScript
$scriptBlock = $scriptBlock.Replace("[URL_TO_REDIRECT_TO]", $newWebUrlWithSlashAtEnd);

# set the redirect time in seconds in the minified JavaScript
$scriptBlock = $scriptBlock.Replace('"[REDIRECT_TIME_IN_SECONDS]"', $redirectTimeInSeconds);

# set the inner html to inject in the minified JavaScript
$replaceSafeInnerHtml = $innerHtmlToInject.Replace('"', '\\"');
$scriptBlock = $scriptBlock.Replace("[INNER_HTML]", $replaceSafeInnerHtml);

# set the script block on the web UserCustomAction
$ourUserCustomAction.ScriptBlock = $scriptBlock;

# save the changes to the SharePoint content database and make them live immediately
$ourUserCustomAction.Update();

# show footer message if not calling from site collection script
if (!$callingFromSiteCollectionScript) 
{
    Write-Host;
    Write-Host "SPRedirectBanner (re)applied successfully!" -ForegroundColor: Green;
    Write-Host;
}