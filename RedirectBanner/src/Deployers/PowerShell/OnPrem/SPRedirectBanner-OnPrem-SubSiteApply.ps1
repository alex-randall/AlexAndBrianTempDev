# SPRedirectBanner-OnPrem-SubSiteApply.ps1 1.0.0
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

# set customization version number string local constant
$customizationVersionNumberString = "1.0.0";

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

# first ensure "old (v0.1)" custom banner not present at the site collection level
$site = $web.Site;
$userCustomActions = $site.UserCustomActions;
$userCustomActionToDelete = $null; 
foreach ($userCustomAction in $userCustomActions) {
    if ($userCustomAction.Name -eq "SPRedirectBannerMsg") {
        $userCustomActionToDelete = $userCustomAction;
        break;
    }
}

# if "old (v0.1)" custom banner  present at the site collection level, delete it
if ($userCustomActionToDelete -ne $null)
{
    $userCustomActionToDelete.Delete();
}

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
    $ourUserCustomAction.Sequence = 1000;
    $ourUserCustomAction.Location = "ScriptLink";
}

# now get the current path of this PowerShell script
$currentPath = split-path -parent $MyInvocation.MyCommand.Definition;
if (!$currentPath.EndsWith("\\")) 
{
    $currentPath = $currentPath + "\\";
}

# minify the JavaScript source code with AjaxMin
$originalPath = $currentPath + "zSPRedirectBanner.js";
$physicalPathToJavaScriptFile = $currentPath + "zSPRedirectBanner.min.js";
& .\AjaxMin\\AjaxMinifier.exe $originalPath -out $physicalPathToJavaScriptFile -silent; 

# get the resulting minified code as a string
$scriptBlock = [System.IO.File]::ReadAllText($physicalPathToJavaScriptFile);

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

# inject the new url into the minified JavaScript
$scriptBlock = $scriptBlock.Replace("[newUrl]", $newWebUrlWithSlashAtEnd);

# add comments around the minified script so it's easy to troubleshoot what version of 
# the SPRedirectBanner is present on the page
$scriptBlock = 
    "/* BEGIN SPRedirectBanner " + 
    $customizationVersionNumberString + 
    " */" + $scriptBlock + 
    "/* END SPRedirectBanner " + 
    $customizationVersionNumberString + 
    " */";

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