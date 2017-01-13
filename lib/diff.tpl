
<!DOCTYPE html> 
<html lang="en"> 
    <head> 
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"> 
        <title>JSON Diff - The semantic JSON compare tool</title> 

        <link rel="stylesheet" href="http://jsondiff.com/reset.css" type="text/css" media="screen">
        <link rel="stylesheet" href="http://jsondiff.com/throbber.css" type="text/css" media="screen">
        <link rel="stylesheet" href="http://jsondiff.com/jdd.css" type="text/css" media="screen">
        
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js" type="text/javascript" charset="utf-8"></script>
        <script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js" type="text/javascript" charset="utf-8"></script>

        <script src="http://jsondiff.com/jsl/jsl.format.js" type="text/javascript" charset="utf-8"></script>
        <script src="http://jsondiff.com/jsl/jsl.parser.js" type="text/javascript" charset="utf-8"></script>
        <script src="http://jsondiff.com/jdd.js" type="text/javascript" charset="utf-8"></script>

        <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-26336682-2', 'auto');
        ga('send', 'pageview');

    </script>
    </head> 
    <body>

        <div id="main">
            <div class="header">
                <h1>JSON Diff</h1>
                <h3>The semantic JSON compare tool</h3>
    
                <div class="weak">
                    <p>
                        Validate, format, and compare two JSON documents.  See the differences between the objects instead of just the new lines and mixed up properties.
                    </p>
    
                    <p>
                        Created by <a href="http://www.zackgrossbart.com">Zack Grossbart</a>.  Get the <a href="https://github.com/zgrossbart/jdd">source code</a>.
                    </p>
    
                    <p>
                        Big thanks owed to the team behind <a href="http://www.jsonlint.com">JSONLint</a>.
                    </p>
    
                </div>
            </div>
    
            <div class="initContainer">
                <div class="left">
                    <textarea spellcheck="false" id="textarealeft" placeholder="Enter JSON to compare, enter an URL to JSON">{{leftJSON}}</textarea>
                    <pre id="errorLeft" class="error"></pre>
                    <span class="fileInput">or <input type="file" id="fileLeft" onchange="jdd.handleFiles(this.files, 'left')"></span>
                </div>
    
                <div class="center">
                    <button id="compare">Compare</button>
                    <div class="throbber-loader"></div>
                    <br/><br/><br/><br/>
                    or try some <a href="#" id="sample">sample data</a>
                </div>
    
                <div class="right">
                    <textarea spellcheck="false" class="right" id="textarearight" placeholder="Enter JSON to compare, enter an URL to JSON">{{rightJSON}}</textarea>
                    <pre id="errorRight" class="error"></pre>
                    <span class="fileInput">or <input type="file" id="fileRight" onchange="jdd.handleFiles(this.files, 'right')"></span>
                </div>
            </div>
    
            <div class="diffcontainer">
                <div id="report">
                </div>
                <pre id="out" class="left" class="codeBlock"></pre>
                <pre id="out2" class="right" class="codeBlock"></pre>
                <ul id="toolbar" class="toolbar"></ul>
            </div>
        </div>
        
    </body>
</html>
