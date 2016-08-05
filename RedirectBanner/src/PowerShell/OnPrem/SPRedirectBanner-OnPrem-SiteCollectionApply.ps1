# SPRedirectBanner-OnPrem-SiteCollectionApply.ps1 1.0.0
#
# A PowerShell script that (re)applies the SharePoint 2010 (or higher) 
# SPRedirectBanner customization to an existing site collection. 
Param(
  [Parameter(Mandatory=$True,Position=1)]
   [string]$siteCollectionUrl,

   [Parameter(Mandatory=$False,Position=2)]
   [string]$newSiteCollectionUrl
)

# force this script to stop immediately if an error occurs and display the error
$ErrorActionPreference = "Stop";

# write header
Write-Host;
Write-Host "(Re)applying SPRedirectBanner to...";
Write-Host;

# get the SharePoint site collection that was specified in the 
# required $webUrl script parameter
$site = Get-SPSite $siteCollectionUrl;

# now get list of all web urls including root web and sort them alphabetically
$webs = $site.AllWebs;
$webUrlSortedList = New-Object 'System.Collections.Generic.SortedList[string, bool]';
foreach ($web in $webs)
{
    $webUrl = $web.Url;
    $webUrlSortedList.Add($webUrl, $false);
}

# get the alphabetically sorted list of web urls
# and assign them to a $webUrls local variable
$webUrls = $webUrlSortedList.Keys;

# construct site collection url minus the last slash (if present)
$siteCollectionUrlMinusLastSlash = $site.Url.TrimEnd('/');

# get the length of the site collection url minus the last slash
$siteCollectionUrlMinusLastSlashLength = $siteCollectionUrlMinusLastSlash.Length;

# construct the new site collection url minutes the last slash (if present) 
$newSiteCollectionUrlMinusLastSlash = $newSiteCollectionUrl.TrimEnd('/');

# loop through each web url (alphabetically)
foreach ($webUrl in $webUrls)
{
    # construct the new web url (autocalculated based off new site collection url)
    $newWebUrl = $newSiteCollectionUrlMinusLastSlash + $webUrl.Remove(0, $siteCollectionUrlMinusLastSlashLength);

    # execute the SPRedirectBanner-OnPrem-SubSiteApply.ps1 PowerShell script
    # to perform the apply logic at the web level 
    & .\SPRedirectBanner-OnPrem-SubSiteApply.ps1 $webUrl $newWebUrl $true;
}

# write footer
Write-Host;
Write-Host "SPRedirectBanner (re)applied successfully!" -ForegroundColor: Green;
Write-Host;