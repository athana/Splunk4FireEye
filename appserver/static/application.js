// !nmealy++
if (Splunk.Module.Message) {
    Splunk.Module.Message= $.klass(Splunk.Module.Message, {
        getHTMLTransform: function($super){
            // Please dont tell me any 'info' about specified fields missing from results,
            // nor lookups, nor 'error' about entityLabelSingular, etc...
            var argh = [
                {contains:"Specified field(s) missing", level:"warn"}, 
                {contains:"lookup", level:"info"}, 
                {contains:"Results written to", level:"info"}, 
                {contains:"entityLabelSingular", level:"error"},
                {contains:"auto-finalized", level:"info"},
                {contains:"Your timerange was substituted", level:"info"}
            ];
            for (var i=0,len=this.messages.length; i<len; i++){
                var message = this.messages[i];
                for (var j=0,jLen=argh.length;j<jLen;j++) {
                    if ((message.content.indexOf(argh[j]["contains"])!=-1) && (message.level == argh[j]["level"])) {
                        this.messages.splice(i,1);
                        break;
                    }
                }
            }
            return $super();
        }
    });
}
switch (Splunk.util.getCurrentView()) {
    
    //---------------------------------------------
    case "fire_eye_hosts": case "fire_eye_callbacks": case "fire_eye_malware": case "fire_eye_cnc":
    /* 
    The NullModule on the fire_eye_hosts page is used to redirect to FireEye's knowledge base
    */
    if (Splunk.Module.NullModule) {
        Splunk.Module.NullModule = $.klass(Splunk.Module.NullModule, {
            onContextChange: function($super) {
                var name = this.getContext().get("click.name");
                var val = this.getContext().get("click.value");
                if (name == "link") {
                    // FireEye sends us escaped equal signs, so we need to unescape them
                    var escVal = val.replace(/\\=/g, "="); 
                    // Check for bogus characters in the URI
                    var semiChar = escVal.indexOf(';');
                    var gtChar = escVal.indexOf('<');
                    if (semiChar >= 0 || gtChar >= 0) {    
                        alert('Page load aborted due to abnormal characters in the URI');
                    } else {
                        // Open in a new window
                        myRef = window.open(escVal);
                    }
                } else if (name == "sname") {
                    // Open in a new window
                    myRef = window.open('https://mil.fireeye.com/edp.php?sname=' + encodeURIComponent(val));
                } else if (name == "correlate") {
                    /*
                    How exactly to explain this hack?  We need to parse the correlate string,
                    create a new search from the values, and send it to /app/FireEye/flashtimeline in a popup. 
                    */
                    var context = this.getContext();
                    var search = context.get("search");
                    search.abandonJob();
                    var args = {};
                    var options = {};
                    var arrTerms = val.split("::");
                    var earliest = parseInt(arrTerms[1]) - 360;
                    var latest = parseInt(arrTerms[2]) + 360;
                    var range = new Splunk.TimeRange(earliest, latest);
                    var corrSearch = 'search ' + arrTerms[0];
                    search.setBaseSearch(corrSearch);
                    search.setTimeRange(range);
                    search.sendToView('flashtimeline', args, true, true, options, 'FireEye');
                }
            }
        });
    }
    if (Splunk.Module.SimpleResultsTable) {
        Splunk.Module.SimpleResultsTable = $.klass(Splunk.Module.SimpleResultsTable, {
            renderResults: function($super, htmlFragment) {
                var retval = $super(htmlFragment);
                $("tr", this.container).each(function() {
                    $("td:eq(1)", this).hide();
                    $("th:eq(1)", this).hide();
                });
            }
        });
    }
    break;
}
