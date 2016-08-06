# SPRedirectBanner-OnPrem-SiteCollectionUninstall.ps1 1.0.0
#
# A PowerShell script that uninstalls the SharePoint 2010 (or higher) 
# SPRedirectBanner customization from an existing single root site, sub 
# site, or web if present.

Param(
   [Parameter(Mandatory=$True,Position=1)]
   [string]$webUrl,

   [Parameter(Mandatory=$false,Position=2)]
   [switch]$callingFromSiteCollectionScript
)

# force this script to stop immediately if an error occurs and display the error
$ErrorActionPreference = "Stop";

# print out header if not calling from site collection script
if (!$callingFromSiteCollectionScript) 
{
    Write-Host;
    Write-Host "Uninstalling SPRedirectBanner from...";
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

if ($ourUserCustomAction -ne $null) {
    # yes it already exists, delete it
    $ourUserCustomAction.Delete();
}

# show footer message if not calling from site collection script
if (!$callingFromSiteCollectionScript) 
{
    Write-Host;
    Write-Host "SPRedirectBanner uninstall successfully!" -ForegroundColor: Green;
    Write-Host;
}