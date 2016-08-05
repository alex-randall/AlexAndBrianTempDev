# SPRedirectBanner-OnPrem-SiteCollectionUninstall.ps1 1.0.0
#
# A PowerShell script that uninstalls the SharePoint 2010 (or higher) 
# SPRedirectBanner customization from an existing site collection 
# if present.

Param(
  [Parameter(Mandatory=$True,Position=1)]
   [string]$siteCollectionUrl
)

# force this script to stop immediately if an error occurs and display the error
$ErrorActionPreference = "Stop";

# write header
Write-Host;
Write-Host "Uninstalling SPRedirectBanner from...";
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

# loop through each web url (alphabetically)
foreach ($webUrl in $webUrls)
{
    # execute the SPRedirectBanner-OnPrem-SubSiteUninstall.ps1 PowerShell script
    # to perform the uninstall logic at the web level 
    & .\SPRedirectBanner-OnPrem-SubSiteUninstall.ps1 $webUrl $true;
}

# write footer
Write-Host;
Write-Host "SPRedirectBanner uninstalled successfully!" -ForegroundColor: Green;
Write-Host;