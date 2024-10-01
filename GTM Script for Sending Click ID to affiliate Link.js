<script>

    /* This code checks the url for parameters like gclid, msclkid, gbraid,
    and utm_source=bing to confirm if a click came from google or bing ads. It then sets a cookie
    to remember the source of traffic and later it appends that traffic source to a form where the clicks
    go to a certain link with query parameter kw, so if its bing ads then the kw is kw=taxihome_bing_ads
    and if its google then kw=taxihome_googleads and if its other source then kw=taxihome_other */


  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  function checkAndUpdateTrafficSource() {
    var urlParams = new URLSearchParams(window.location.search);
    var currentTrafficSource = '';
    var currentClickId = '';

    if (urlParams.has('gad_source') || urlParams.has('gclid') || urlParams.has('gbraid') || urlParams.has('wbraid')) {
      currentTrafficSource = 'google_ads';
      currentClickId = urlParams.get('gclid') || '';
      console.log('Current traffic source:', currentTrafficSource);
      console.log('Current click ID:', currentClickId);
    } else if (urlParams.has('msclkid') || urlParams.get('utm_source') === 'bing') {
      currentTrafficSource = 'bing_ads';
      currentClickId = urlParams.get('msclkid') || '';
      console.log('Current traffic source:', currentTrafficSource);
      console.log('Current click ID:', currentClickId);
    }

    var storedTrafficSource = getCookie('ourTrafficSource');
    var storedClickId = getCookie('ourClickId');
    console.log('Stored traffic source:', storedTrafficSource);
    console.log('Stored click ID:', storedClickId);

    // Update if a new paid source (Google or Bing) is detected or if the source has changed
    if (currentTrafficSource && (currentTrafficSource === 'google_ads' || currentTrafficSource === 'bing_ads')) {
      if (currentTrafficSource !== storedTrafficSource) {
        setCookie('ourTrafficSource', currentTrafficSource, 30);
        setCookie('ourClickId', currentClickId, 30); // Always update click ID when source changes
        console.log('Traffic source cookie updated:', currentTrafficSource);
        console.log('Click ID cookie updated along source:', currentClickId);
      } else if (currentClickId && currentClickId !== storedClickId) {
        setCookie('ourClickId', currentClickId, 30);
        console.log('Click ID cookie updated without changing source:', currentClickId);
      }
      else {
        console.log('current source same as old source, no changes');
      }
    } else if (!storedTrafficSource) {
      // Only set to 'other' if no source is stored and no paid source is detected
      setCookie('ourTrafficSource', 'other', 30);
      setCookie('ourClickId', '', 30); // Clear click ID for 'other' sources
      console.log('Traffic source cookie set to "other"');
      console.log('Click ID cookie cleared');
    }
  }

  // Call this function when the script runs
  checkAndUpdateTrafficSource();

  // Check the URL for traffic source parameters only if cookies are not set
 

  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
  
  function appendTrafficSourceToLink() {
    console.log('Attempting to modify links based on ourTrafficSource');
    var quoteZoneLinks = document.querySelectorAll('a[href*="quotezone.co.uk/minibus/index.php"]');
    console.log('Number of QuoteZone links found:', quoteZoneLinks.length);
    var ourTrafficSource = getCookie('ourTrafficSource');
    var ourClickId = getCookie('ourClickId');
    console.log('Stored ourTrafficSource:', ourTrafficSource);
    console.log('Stored ourClickId:', ourClickId);

    if (quoteZoneLinks.length > 0 && ourTrafficSource) {
        quoteZoneLinks.forEach(function(link) {
            modifyQuoteZoneLink(link, ourTrafficSource, ourClickId);
        });
    } else {
        console.log('QuoteZone links not found or no stored ourTrafficSource');
    }
}

function modifyQuoteZoneLink(link, ourTrafficSource, ourClickId) {
    var url = new URL(link.href);
    var kw = url.searchParams.get('kw') || '';
    
    if (ourTrafficSource === 'bing_ads') {
        kw += '_bingads';
    } else if (ourTrafficSource === 'google_ads') {
        kw += '_googleads';
    }
    
    if (ourClickId) {
        kw += '_' + ourClickId;
    }
    
    url.searchParams.set('kw', kw);
    link.href = url.toString();
    console.log('Modified QuoteZone link href:', link.href);
}

// Call the function when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', appendTrafficSourceToLink);
} else {
    appendTrafficSourceToLink();
}

// Also call the function after a short delay to catch any dynamically added elements
// setTimeout(appendTrafficSourceToKw, 2000);
</script>