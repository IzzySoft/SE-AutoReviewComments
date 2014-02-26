// ==UserScript==
// @name           AutoReviewComments
// @namespace      benjol
// @version        1.3.1izzy2
// @description    Add pro-forma comments dialog for reviewing (pre-flag)
// @grant          none
// @include        http*://*stackoverflow.com/questions*
// @include        http*://*stackoverflow.com/review*
// @include        http*://*stackoverflow.com/admin/dashboard*
// @include        http*://*stackoverflow.com/tools*
// @include        http*://*serverfault.com/questions*
// @include        http*://*serverfault.com/review*
// @include        http*://*serverfault.com/admin/dashboard*
// @include        http*://*serverfault.com/tools*
// @include        http*://*superuser.com/questions*
// @include        http*://*superuser.com/review*
// @include        http*://*superuser.com/admin/dashboard*
// @include        http*://*superuser.com/tools*
// @include        http*://*stackexchange.com/questions*
// @include        http*://*stackexchange.com/review*
// @include        http*://*stackexchange.com/admin/dashboard*
// @include        http*://*stackexchange.com/tools*
// @include        http*://*askubuntu.com/questions*
// @include        http*://*askubuntu.com/review*
// @include        http*://*askubuntu.com/admin/dashboard*
// @include        http*://*askubuntu.com/tools*
// @include        http*://*answers.onstartups.com/questions*
// @include        http*://*answers.onstartups.com/review*
// @include        http*://*answers.onstartups.com/admin/dashboard*
// @include        http*://*answers.onstartups.com/tools*
// @include        http*://*mathoverflow.net/questions*
// @include        http*://*mathoverflow.net/review*
// @include        http*://*mathoverflow.net/admin/dashboard*
// @include        http*://*mathoverflow.net/tools*
// @include        http*://discuss.area51.stackexchange.com/questions/*
// @include        http*://discuss.area51.stackexchange.com/review*
// @include        http*://discuss.area51.stackexchange.com/admin/dashboard*
// @include        http*://discuss.area51.stackexchange.com/tools*
// @include        http*://stackapps.com/questions*
// @include        http*://stackapps.com/review*
// @include        http*://stackapps.com/admin/dashboard*
// @include        http*://stackapps.com/tools*
// ==/UserScript==

function with_jquery(f) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.textContent = "(" + f.toString() + ")(jQuery)";
  document.body.appendChild(script);
};

with_jquery(function ($) {
  StackExchange.ready(function () {
    //**selfupdatingscript starts here (see https://gist.github.com/raw/874058/selfupdatingscript.user.js)
    var VERSION = '1.3.1izzy2';  //<<<<<<<<<<<<*********************** DON'T FORGET TO UPDATE THIS!!!! *************************
    var URL = "https://github.com/IzzySoft/SE-AutoReviewComments/raw/per_site_comments/autoreviewcomments.user.js";

    if(window["selfUpdaterCallback:" + URL]) {
      window["selfUpdaterCallback:" + URL](VERSION);
      return;
    }

    function updateCheck(notifier) {
      window["selfUpdaterCallback:" + URL] = function (newver) {
        if(newver > VERSION) notifier(newver, VERSION, URL);
      }
      $("<script />").attr("src", URL).appendTo("head");
    }
    //**selfupdatingscript ends here (except for call to updateCheck further down in code)

    //autoreviewcomments script starts here
    var siteurl = window.location.hostname;
    var arr = document.title.split(' - ');
    var sitename = arr[arr.length - 1];
    var username = 'user';
    var myuserid = getLoggedInUserId();
    var OP = 'OP';
    var prefix = "AutoReviewComments-"; //prefix to avoid clashes in localstorage

    var greeting = 'Welcome to  ' + sitename.replace(/ ?Stack Exchange/,'') + '! ';
    var showGreeting = false;

    var markupTemplate = '                                                                            \
    <div id="popup" class="popup" style="width:690px; position: absolute; display: block">            \
       <div id="close" class="popup-close"><a title="close this popup (or hit Esc)">&#215;</a></div>  \
       <h2 class="handle">Which review comment to insert?</h2>                                        \
       <div style="overflow:hidden" id="main">                                                        \
         <div class="popup-active-pane">                                                              \
           <div id="userinfo" style="padding:5px;background:#EAEFEF">                                 \
              <img src="http://sstatic.net/img/progress-dots.gif"/>                                   \
           </div>                                                                                     \
          <ul class="action-list" style="height:440;overflow-y:auto" >                                \
          </ul>                                                                                       \
         </div>                                                                                       \
         <div style="display:none" class="share-tip" id="remote-popup">                               \
            enter url for remote source of comments (use import/export to create jsonp)               \
            <input id="remoteurl" type="text" style="display: block; width: 400px;"\>                 \
            <img id="throbber1" style="display:none" src="http://sstatic.net/img/progress-dots.gif"/> \
            <span id="remoteerror1" style="color:red"/>                                               \
            <div style="float:left">                                                                  \
              <input type="checkbox" id="remoteauto"\>                                                \
              <label title="get from remote on every page refresh" for="remoteauto">auto-get</label>  \
            </div>                                                                                    \
            <div style="float:right">                                                                 \
              <a class="remote-get">get now</a>                                                       \
              <span class="lsep"> | </span>                                                           \
              <a class="remote-save">save</a>                                                         \
              <span class="lsep"> | </span>                                                           \
              <a class="remote-cancel">cancel</a>                                                     \
            </div>                                                                                    \
        </div>                                                                                        \                                                                                       \
         <div style="display:none" class="share-tip" id="welcome-popup">                              \
            configure "welcome" message (empty=none):                                                 \
            <div>                                                                                     \
              <input id="customwelcome" type="text" style="width: 300px;"\>                           \
            </div>                                                                                    \
            <div style="float:right">                                                                 \
              <a class="welcome-force">force</a>                                                      \
              <span class="lsep"> | </span>                                                           \
              <a class="welcome-save">save</a>                                                        \
              <span class="lsep"> | </span>                                                           \
              <a class="welcome-cancel">cancel</a>                                                    \
            </div>                                                                                    \
        </div>                                                                                        \
         <div class="popup-actions">                                                                  \
          <div style="float: left; margin-top: 18px;">                                                \
            <a title="close this popup (or hit Esc)" class="popup-actions-cancel">cancel</a>          \
            <span class="lsep"> | </span>                                                             \
            <a title="see info about this popup" class="popup-actions-help" href="http://stackapps.com/q/2116" target="_blank">info</a>  \
            <span class="lsep"> | </span>                                                             \
            <a class="popup-actions-see">see-through</a>                                              \
            <span class="lsep"> | </span>                                                             \
            <a title="reset any custom comments" class="popup-actions-reset">reset</a>                \
            <span class="lsep"> | </span>                                                             \
            <a title="use this to import/export all comments" class="popup-actions-impexp">import/export</a>    \
            <span class="lsep"> | </span>                                                             \
            <a title="use this to hide/show all comments" class="popup-actions-toggledesc">show/hide desc</a>    \
            <span class="lsep"> | </span>                                                             \
            <a title="setup remote source" class="popup-actions-remote">remote</a>                    \
            <img id="throbber2" style="display:none" src="http://sstatic.net/img/progress-dots.gif"/> \
            <span id="remoteerror2" style="color:red"/>                                               \
            <span class="lsep"> | </span>                                                             \
            <a title="configure welcome" class="popup-actions-welcome">welcome</a>                    \
          </div>                                                                                      \
          <div style="float:right">                                                                   \
            <input class="popup-submit" type="button" disabled="disabled" style="float:none; margin-left: 5px" value="Insert">  \
          </div>                                                                                      \
         </div>                                                                                       \
       </div>                                                                                         \
    </div>';

    var messageTemplate = '                                                                                                              \
    <div id="announcement" style="background:orange;padding:7px;margin-bottom:10px;font-size:15px">                               \
      <span class="notify-close" style="border:2px solid black;cursor:pointer;display:block;float:right;margin:0 4px;padding:0 4px;line-height:17px">  \
         <a title="dismiss this notification" style="color:black;text-decoration:none;font-weight:bold;font-size:16px">x</a>      \
      </span>                                                                                                                     \
      <strong>$TITLE$</strong> $BODY$                                                                                           \
    </div>';

    var optionTemplate = '                                                          \
    <li>                                                                    \
      <input id="comment-$ID$" type="radio" name="commentreview"/>          \
      <label for="comment-$ID$">                                            \
        <span id="name-$ID$" class="action-name">$NAME$</span>              \
        <span id="desc-$ID$" class="action-desc">$DESCRIPTION$</span>       \
      </label>                                                              \
    </li>';

    //default comments
    var defaultcomments = [
     { Name: "[Q]App recommendation", Description: "Please note that recommendations like *Is there an app for X* are off-topic here (see [What topics can I ask about here?](http://$SITEURL$/help/on-topic) for details). For where your question might fit better, you might want to look into [Where can I ask questions that aren't Android Enthusiast questions?](http://meta.android.stackexchange.com/q/371/$MYUSERID$)", Site: "android.stackexchange.com" },
     { Name: "[Q]Low question quality", Description: "We will need much more information to give good recommendations here. Please take a look at [What is required for a question to contain \"enough information\"?](http://meta.softwarerecs.stackexchange.com/q/336/$MYUSERID$) Then please [edit] your question and see if you can incorporate some of these improvements.", Site: "softwarerecs.stackexchange.com" },
     { Name: "[Q]Development question", Description: "This site is for *users* of Android, which means that questions about development/programming are off-topic here (see the [What topics can I ask about here?](http://android.stackexchange.com/help/on-topic)). Development questions are on-topic on our sister site [Stack Overflow](http://stackoverflow.com/questions/tagged/android). You might also wish to consult [Where can I ask questions that aren\'t Android Enthusiast questions?](http://meta.android.stackexchange.com/q/371/$MYUSERID$) for a fitting place to your question.", Site: "android.stackexchange.com" },
     { Name: "[Q]XY-problem", Description: "This seems to be an [XY problem](http://meta.stackoverflow.com/q/66377/192154). Instead of trying to get your supposed solution working: Mind telling us about the issue behind it?" },
     { Name: "[Q]More than one question asked", Description: "The question-and-answer format of this site works best if you put each question in a separate question post. Please [edit] your post down to one question, and create new posts to ask any further questions. You\'ll get better answers that way."},  
     { Name: "[Q]OP providing facts in a comment", Description: "The best way to add additional information to your question is by editing it, with the [edit] link. It is better visible that way, and comments are mainly for secondary, temporary purposes. Comments are removed under a variety of circumstances. Anything important to your question should be in the question itself."},  
     { Name: "[Q]Frequent Question (use Search)", Description: "This happens to be a question frequently asked on our site. Have you tried our on-site search? See [How do I search?](http://$SITEURL$/help/searching) for help using it."},
     { Name: "[A]OP adding a new question as an answer", Description: "Remember this is a Q&A site, so keep on [edit]ing your question with new information – this section is for actual answers. If you have another question, please ask it by clicking the [Ask Question](http://$SITEURL$/questions/ask) button."},
     { Name: "[A]OP using an answer for further information", Description: "This is a question-and-answer site, not a forum. Please use the *Post answer* button only if you have a solution to the problem, so that other users can see your question is not yet answered. You can click *edit* on the question to add more information to it."},
     { Name: "[A]Answers just to say Thanks!", Description: "This is a question-and-answer site, not a forum – so please don\'t add \"thanks\" as answers. Invest some time in the site and you will gain sufficient [privileges](http://$SITEURL$/privileges) to upvote answers you like, which is the $SITENAME$ way of saying thank you." },
     { Name: "[A]Nothing but a URL (and isn\'t spam)", Description: "Whilst this may theoretically answer the question, [it would be preferable](http://meta.stackoverflow.com/q/8259) to include the essential parts of the answer here, and provide the link for reference. Otherwise, your answer becomes useless in case the link dies." },
     { Name: "[A]Comments as an answer (new users)", Description: "This is a question-and-answer site, not a forum: please don\'t add comments as answers. Invest some time in the site and you will gain sufficient [privileges](http://$SITEURL$/privileges) to upvote answers you like, or to add actual comments when seeking clarification of any issues."},
     { Name: "[A]Comments as an answer (experienced users)", Description: "This is a question-and-answer site, not a forum: please don\'t add comments as answers. Use actual comments when seeking clarification of any issues."},
     { Name: "[A]Answer that is a question", Description: "This is a question-and-answer site, not a forum. Please use the *Post answer* button only if you have a solution to the problem. If you have another question, please ask it by clicking the [Ask Question](http://$SITEURL$/questions/ask) button. Include a link to this question if it helps provide context."},
     { Name: "[A]Requests to OP for further information", Description: "This is really a comment, not an answer. With a bit more rep, [you will be able to post comments](http://$SITEURL$/privileges/comment). For the moment I\'ve added the comment for you, and I\'m flagging this post for deletion." },
     { Name: "[A]Another user adding a \'Me too!\'", Description: "This is a question-and-answer site, not a forum. Please use the *Post answer* button only if you have a solution to the problem. If you have a NEW question, please ask it by clicking the [Ask Question](http://$SITEURL$/questions/ask) button. If you have sufficient reputation, [you may upvote](http://$SITEURL$/privileges/vote-up) the question. Alternatively, \"star\" it as a favorite and you will be notified of any new answers." },
     { Name: "[A]Low quality answer", Description: "This post does not contain enough information to be considered a high quality answer. Please [read our discussion on what makes an answer high quality](http://meta.softwarerecs.stackexchange.com/q/356/$MYUSERID$) to see if you can incorporate some of these improvements into your answer, otherwise it will be removed.", Site: "softwarerecs.stackexchange.com" }
    ];

    var weekday_name = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var minute = 60, hour = 3600, day = 86400, sixdays = 518400, week = 604800, month = 2592000, year = 31536000;

    //Wrap local storage access so that we avoid collisions with other scripts
    // function GetStorage(key) { return localStorage[prefix + key]; } // caused the script to break for me at some points, throwing "GetStorage is undefined". So:
    function GetStorage(key) { var st = localStorage[prefix + key]; if (st==undefined) return ''; return st; } // *!* Needs check for possible side-effects where "undefined" is wanted
    function SetStorage(key, val) { localStorage[prefix + key] = val; }
    function RemoveStorage(key) { localStorage.removeItem(prefix + key); }
    function ClearStorage(startsWith) {
      for(var i = localStorage.length - 1; i >= 0; i--) {
        var key = localStorage.key(i);
        if(key.indexOf(prefix + startsWith) == 0) localStorage.removeItem(key);
      }
    }

    //Calculate and format datespan for "Member since/for"
    function datespan(date) {
      var now = new Date() / 1000;
      var then = new Date(date * 1000);
      var today = new Date().setHours(0, 0, 0) / 1000;
      var nowseconds = now - today;
      var elapsedSeconds = now - date;
      var strout = "";
      if(elapsedSeconds < nowseconds) strout = "since today";
      else if(elapsedSeconds < day + nowseconds) strout = "since yesterday";
      else if(elapsedSeconds < sixdays) strout = "since " + weekday_name[then.getDay()];
      else if(elapsedSeconds > year) {
        strout = "for " + Math.round((elapsedSeconds) / year) + " years";
        if(((elapsedSeconds) % year) > month) strout += ", " + Math.round(((elapsedSeconds) % year) / month) + " months";
      }
      else if(elapsedSeconds > month) {
        strout = "for " + Math.round((elapsedSeconds) / month) + " months";
        if(((elapsedSeconds) % month) > week) strout += ", " + Math.round(((elapsedSeconds) % month) / week) + " weeks";
      }
      else {
        strout = "for " + Math.round((elapsedSeconds) / week) + " weeks";
      }
      return strout;
    }

    //Calculate and format datespan for "Last seen"
    function lastseen(date) {
      var now = new Date() / 1000;
      var today = new Date().setHours(0, 0, 0) / 1000;
      var nowseconds = now - today;
      var elapsedSeconds = now - date;
      if(elapsedSeconds < minute) return (Math.round(elapsedSeconds) + " seconds ago");
      if(elapsedSeconds < hour) return (Math.round((elapsedSeconds) / minute) + " minutes ago");
      if(elapsedSeconds < nowseconds) return (Math.round((elapsedSeconds) / hour) + " hours ago");
      if(elapsedSeconds < day + nowseconds) return ("yesterday");
      var then = new Date(date * 1000);
      if(elapsedSeconds < sixdays) return ("on " + weekday_name[then.getDay()]);
      return then.toDateString();
    }

    //Format reputation string
    function repNumber(r) {
      if(r < 1E4) return r;
      else if(r < 1E5) {
        var d = Math.floor(Math.round(r / 100) / 10);
        r = Math.round((r - d * 1E3) / 100);
        return d + (r > 0 ? "." + r : "") + "k"
      }
      else return Math.round(r / 1E3) + "k"
    }

    // Get the Id of the logged-in user
    function getLoggedInUserId() {
      if ( document.getElementsByClassName('profile-me')[0].href.match(/\/users\/(\d+)\/.*/i) ) {
        return RegExp.$1;
      } else {
        return '';
      }
    }

    //Get userId for post
    function getUserId(el) {
      // a bit complicated, but we have to avoid edits (:last), not trip on CW questions (:not([id])), and not bubble
      //  out of post scope for deleted users (first()).
      var userlink = el.parents('div').find('.post-signature:last').first().find('.user-details > a:not([id])');
      if(userlink.length) return userlink.attr('href').split('/')[2];
      return "[NULL]";
    }
    function isNewUser(date) {
      return (new Date() / 1000) - date < week
    }
    function getOP() {
      var userlink = $('#question').find('.owner').find('.user-details > a:not([id])');
      if(userlink.length) return userlink.text();
      var user = $('#question').find('.owner').find('.user-details'); //for deleted users
      if(user.length) return user.text();
      return "[NULL]";
    }

    //Ajax to Stack Exchange api to get basic user info, and paste into userinfo element
    //http://soapi.info/code/js/stable/soapi-explore-beta.htm
    function getUserInfo(userid, container) {
      var userinfo = container.find('#userinfo');
      if(isNaN(userid)) {
        userinfo.fadeOutAndRemove();
        return;
      }
      $.ajax({
        type: "GET",
        url: 'http://api.stackexchange.com/2.2/users/' + userid + '?site=' + siteurl + '&jsonp=?',
        dataType: "jsonp",
        timeout: 2000,
        success: function (data) {
          if(data['items'].length > 0) {
            var user = data['items'][0];
            if(isNewUser(user['creation_date'])) {
              showGreeting = true;
              container.find('.action-desc').prepend(greeting);
            }
            username = user['display_name'];
            var usertype = user['user_type'].charAt(0).toUpperCase() + user['user_type'].slice(1);
            var html = usertype + ' user <strong><a href="/users/' + userid + '" target="_blank">' + username + '</a></strong>,     \
                            member <strong>' + datespan(user['creation_date']) + '</strong>,                                        \
                            last seen <strong>' + lastseen(user['last_access_date']) + '</strong>,                                  \
                            reputation <strong>' + repNumber(user['reputation']) + '</strong>';

            userinfo.html(html.replace(/ +/g, ' '));
          }
          else userinfo.fadeOutAndRemove();
        },
        error: function () { userinfo.fadeOutAndRemove(); }
      });
    }

    //Show textarea in front of popup to import/export all comments (for other sites or for posting somewhere)
    function ImportExport(popup) {
      var tohide = popup.find('#main');
      var div = $('<div><textarea/><a class="jsonp">jsonp</a><span class="lsep"> | </span><a class="save">save</a><span class="lsep"> | </span><a class="cancel">cancel</a></div>');
      //Painful, but shortest way I've found to position div over the tohide element
      div.css({ position: 'absolute', left: tohide.position().left, top: tohide.position().top,
        width: tohide.css('width'), height: tohide.css('height'), background: 'white'
      });

      var txt = '';
      for(var i = 0; i < GetStorage("commentcount"); i++) {
        var name = GetStorage('name-' + i);
        var desc = GetStorage('desc-' + i);
        var site = GetStorage('site-' + i);
        if (site==undefined) site = '';
        txt += '###' + name + '\n' + '§§§' + site + '\n' + htmlToMarkDown(desc) + '\n\n'; //the leading ### makes prettier if pasting to markdown, and differentiates names from descriptions
      }

      div.find('textarea').width('100%').height('95%').val(txt);
      div.find('.jsonp').click(function () {
        var txt = 'callback(\n[\n';
        for(var i = 0; i < GetStorage("commentcount"); i++) {
          txt += '{ "name": "' + GetStorage('name-' + i) + '", "description": "' + GetStorage('desc-' + i).replace(/"/g, '\\"') + '"},\n\n';
        }
        div.find('textarea').val(txt + ']\n)');
        div.find('a:lt(2)').remove(); div.find('.lsep:lt(2)').remove();
      });
      div.find('.cancel').click(function () { div.fadeOutAndRemove(); });
      div.find('.save').click(function () { DoImport(div.find('textarea').val()); WriteComments(popup); div.fadeOutAndRemove(); });

      popup.append(div);
    }

    //Import complete text into comments
    function DoImport(text) {
      //clear out any existing stuff
      ClearStorage("name-"); ClearStorage("desc-"); ClearStorage("site-");
      var arr = text.split('\n');
      var nameIndex = 0, descIndex = 0, siteIndex = 0;
      for(var i = 0; i < arr.length; i++) {
        var line = $.trim(arr[i]);
        if(line.indexOf('#') == 0) {
          SetStorage('name-' + nameIndex, line.substr(3)); // maybe better keep line.replace(/^#+/g, '') ?
          nameIndex++;
        }
        else if(line.indexOf('§') == 0) {
          SetStorage('site-' + siteIndex, line.substr(3)); // maybe better line.replace(/^§+/g, '') ?
          siteIndex++;
        }
        else if(line.length > 0) {
          var desc = markDownToHtml(line);
          SetStorage('desc-' + descIndex, Tag(desc));
          descIndex++;
        }
      }
      //This is de-normalised, but I don't care.
      SetStorage("commentcount", Math.min(nameIndex, descIndex));
    }

    function htmlToMarkDown(html) {
      markdown = html.replace(/<a href="(.+?)">(.+?)<\/a>/g, '[$2]($1)').replace(/&amp;/g, '&');
      return markdown.replace(/<em>(.+?)<\/em>/g, '*$1*').replace(/<strong>(.+?)<\/strong>/g, '**$1**');
    }

    function markDownToHtml(markdown) {
      html = markdown.replace(/\[([^\]]+)\]\((.+?)\)/g, '<a href="$2">$1</a>');
      return html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*([^`]+?)\*/g, '<em>$1</em>');
    }

    function UnTag(text) {
      return text.replace(/\$SITENAME\$/g, sitename).replace(/\$SITEURL\$/g, siteurl).replace(/\$MYUSERID\$/g, myuserid);
    }

    function Tag(html) {
      //put tags back in
      var regname = new RegExp(sitename, "g"), regurl = new RegExp('http://' + siteurl, "g"), reguid = new RegExp('/' + myuserid + '[)]', "g");
      return html.replace(regname, '$SITENAME$').replace(regurl, 'http://$SITEURL$').replace(reguid, '/$MYUSERID$)'); // myuserid/$MYUSERID$ ???
    }

    //Replace contents of element with a textarea (containing markdown of contents), and save/cancel buttons
    function ToEditable(el) {
      var backup = el.html();
      var html = Tag(el.html().replace(greeting, ''));  //remove greeting before editing..
      if(html.indexOf('<textarea') > -1) return; //don't want to create a new textarea inside this one!
      var txt = $('<textarea />').css('height', 2 * el.height())
                .css('width', el.css('width'))
                .val(htmlToMarkDown(html));

      BorkFor(el); //this is a hack
      //save/cancel links to add to textarea
      var commands = $('<a>save</a>').click(function () { SaveEditable($(this).parent()); UnborkFor(el); })
                      .add('<span class="lsep"> | </span>')
                      .add($('<a>cancel</a>').click(function () { CancelEditable($(this).parent(), backup); UnborkFor(el); }));
      //set contents of element to textarea with links
      el.html(txt.add(commands));
    }

    //This is to stop the input pinching focus when I click inside textarea
    //Could have done something clever with contentEditable, but this is evil, and it annoys Yi :P
    function BorkFor(el) {
      var label = el.parent('label');
      label.attr('for', 'borken');
    }
    function UnborkFor(el) {
      var label = el.parent('label');
      label.attr('for', label.prev().attr('id'));
    }
    //Save textarea contents, replace element html with new edited content
    function SaveEditable(el) {
      var html = markDownToHtml(el.find('textarea').val());
      SetStorage(el.attr('id'), Tag(html));
      el.html((showGreeting ? greeting : "") + UnTag(html));
    }

    function CancelEditable(el, backup) {
      el.html(backup);
    }

    //Empty all custom comments from storage and rewrite to ui
    function ResetComments() {
      ClearStorage("name-"); ClearStorage("desc-"); ClearStorage("site-");
      $.each(defaultcomments, function (index, value) {
        SetStorage('name-' + index, value["Name"]);
        SetStorage('desc-' + index, value["Description"]);
        if ( value["Site"] == undefined ) SetStorage('site-' + index, '');
        else SetStorage('site-' + index, value["Site"]);
      });
      SetStorage("commentcount", defaultcomments.length);
    }

    //rewrite all comments to ui (typically after import or reset)
    function WriteComments(popup) {
      if(!GetStorage("commentcount")) ResetComments();
      var ul = popup.find('.action-list');
      ul.empty();
      for(var i = 0; i < GetStorage("commentcount"); i++) {
        var commenttype = GetCommentType(GetStorage('name-' + i));
        if(commenttype == "any" || (commenttype == popup.posttype)) {
          var tsite = GetStorage('site-' + i);
          if ( !(tsite == undefined || tsite == '' || tsite == siteurl) ) continue;
          var desc = GetStorage('desc-' + i).replace(/\$SITENAME\$/g, sitename).replace(/\$SITEURL\$/g, siteurl).replace(/\$MYUSERID\$/g, myuserid).replace(/\$/g, "$$$");
          var opt = optionTemplate.replace(/\$ID\$/g, i)
                          .replace("$NAME$", GetStorage('name-' + i).replace(/\$/g, "$$$"))
                          .replace("$DESCRIPTION$", (showGreeting ? greeting : "") + desc);
          ul.append(opt);
        }
      }
      ShowHideDescriptions(popup);
      AddOptionEventHandlers(popup);
    }

    function GetCommentType(comment) {
      if(comment.indexOf('[Q]') > -1) return "question";
      if(comment.indexOf('[A]') > -1) return "answer";
      return "any";
    }

    function AddOptionEventHandlers(popup) {
      popup.find('label > span').dblclick(function () { ToEditable($(this)); });
      //add click handler to radio buttons
      popup.find('input:radio').click(function () {
        popup.find('.popup-submit').removeAttr("disabled"); //enable submit button
        //unset/set selected class, hide others if necessary
        $(this).parents('ul').find('.action-selected').removeClass('action-selected');
        if(GetStorage('hide-desc') == "hide") {
          $(this).parents('ul').find('.action-desc').hide();
        }
        $(this).parent().addClass('action-selected')
                        .find('.action-desc').show();
      });
      popup.find('input:radio').keyup(function (event) {
        if(event.which == 13) {
          event.preventDefault();
          popup.find('.popup-submit').trigger('click');
        }
      });
    }

    //Adjust the descriptions so they show or hide based on the user's preference.
    function ShowHideDescriptions(popup) {
      //get list of all descriptions except the currently selected one
      var descriptions = popup.find("ul.action-list li:not(.action-selected) span[id*='desc-']");

      if(GetStorage('hide-desc') == "hide") {
        descriptions.hide();
      }
      else {
        descriptions.show();
      }
    }

    //Show a message (like notify.show) inside popup
    function ShowMessage(popup, title, body, callback) {
      var html = body.replace(/\n/g, '<BR/>');
      var message = $(messageTemplate.replace("$TITLE$", title)
                          .replace('$BODY$', html));
      message.find('.notify-close').click(function () {
        $(this).parent().fadeOutAndRemove();
        callback();
      });
      popup.find('h2').before(message);
    }

    //We only show announcement once for each version
    function CheckForAnnouncement(popup) {
      var previous = GetStorage("LastMessage");
      GetRemote('http://dl.dropbox.com/u/2835366/SO/announcement.json', function (announcement) {
        if(previous != announcement.id) {
          ShowMessage(popup, "Service announcement", announcement.message, function () { SetStorage("LastMessage", announcement.id); });
        }
      });
    }

    //Get remote content via ajax, target url must contain valid json wrapped in callback() function
    function GetRemote(url, callback, onerror) {
      $.ajax({ type: "GET", url: url + '?jsonp=?', dataType: "jsonp", jsonpCallback: "callback", timeout: 2000, success: callback, error: onerror, async: false });
    }

    //Check to see if a new version has become available since last check
    // only checks once a day
    function CheckForNewVersion(popup) {
      var today = (new Date().setHours(0, 0, 0, 0));
      var lastCheck = GetStorage("LastUpdateCheckDay");
      if(lastCheck == null) { //first time visitor
        ShowMessage(popup, "Please read this!", 'Thanks for installing this script. \
                            Please note that you can EDIT the texts inline by double-clicking them. \
                            For other options, please read the full text <a href="http://stackapps.com/q/2116" target="_blank">here</a>.',
                            function () { });
      }
      if(lastCheck != null && lastCheck != today) {
        var lastVersion = GetStorage("LastVersionAcknowledged");
        updateCheck(function (newver, oldver, url) {
          if(newver != lastVersion) {
            ShowMessage(popup, "New Version!", 'A new version (' + newver + ') of the <a href="http://stackapps.com/q/2116">AutoReviewComments</a> userscript is now available (this notification will only appear once per new version, and per site).',
              function () { SetStorage("LastVersionAcknowledged", newver); });
          }
        });
      }
      SetStorage("LastUpdateCheckDay", today);
    }

    //customise welcome
    //reverse compatible!
    function LoadFromRemote(url, done, error) {
      GetRemote(url, function (data) {
        SetStorage("commentcount", data.length);
        ClearStorage("name-"); ClearStorage("desc-"); ClearStorage("site-");
        $.each(data, function (index, value) {
          SetStorage('name-' + index, value.name);
          SetStorage('desc-' + index, markDownToHtml(value.description));
          if ( value.Site == undefined ) SetStorage('site-' + index, '');
          else SetStorage('site-' + index, value.Site);
        });
        done();
      }, error);
    }

    //Factored out from main popu creation, just because it's too long
    function SetupRemoteBox(popup) {
      var remote = popup.find('#remote-popup');
      var remoteerror = remote.find('#remoteerror1');
      var urlfield = remote.find('#remoteurl');
      var autofield = remote.find('#remoteauto');
      var throbber = remote.find("#throbber1");

      popup.find('.popup-actions-remote').click(function () {
        urlfield.val(GetStorage("RemoteUrl"));
        autofield.prop('checked', GetStorage("AutoRemote") == 'true');
        remote.show();
      });

      popup.find('.remote-cancel').click(function () {
        throbber.hide();
        remoteerror.text("");
        remote.hide();
      });

      popup.find('.remote-save').click(function () {
        SetStorage("RemoteUrl", urlfield.val());
        SetStorage("AutoRemote", autofield.prop('checked'));
        remote.hide();
      });

      popup.find('.remote-get').click(function () {
        throbber.show();
        LoadFromRemote(urlfield.val(), function () {
          WriteComments(popup);
          throbber.hide();
        }, function (d, msg) {
          remoteerror.text(msg);
        });
      });
    }

    function SetupWelcomeBox(popup) {
      var welcome = popup.find('#welcome-popup');
      var custom = welcome.find('#customwelcome');

      popup.find('.popup-actions-welcome').click(function () {
        custom.val(greeting);
        welcome.show();
      });

      popup.find('.welcome-cancel').click(function () {
        welcome.hide();
      });

      popup.find('.welcome-force').click(function () {
        showGreeting = true;
        WriteComments(popup);
        welcome.hide();
      });

      popup.find('.welcome-save').click(function () {
        var msg = custom.val() == "" ? "NONE" : custom.val();
        SetStorage("WelcomeMessage", msg);
        greeting = custom.val();
        welcome.hide();
      });
    }

    //This is where the real work starts - add the 'auto' link next to each comment 'help' link
    //use most local root-nodes possible (have to exist on page load) - #questions is for review pages
    $("#content").delegate(".comments-link", "click", function () {
      var divid = $(this).attr('id').replace('-link', '');
      var posttype = $(this).parents(".question, .answer").attr("class").split(' ')[0]; //slightly fragile

      if($('#' + divid).find('.comment-auto-link').length > 0) return; //don't create auto link if already there
      var newspan = $('<span class="lsep"> | </span>').add($('<a class="comment-auto-link">auto</a>').click(function () {
        //Create popup and wire-up the functionality
        var popup = $(markupTemplate);
        popup.find('.popup-close').click(function () { popup.fadeOutAndRemove(); });
        popup.posttype = posttype;

        //Reset this, otherwise we get the greeting twice...
        showGreeting = false;

        //create/add options
        WriteComments(popup);

        //Add handlers for command links
        popup.find('.popup-actions-cancel').click(function () { popup.fadeOutAndRemove(); });
        popup.find('.popup-actions-reset').click(function () { ResetComments(); WriteComments(popup); });
        popup.find('.popup-actions-see').hover(function () {
          popup.fadeTo('fast', '0.4').children().not('#close').fadeTo('fast', '0.0')
        }, function () {
          popup.fadeTo('fast', '1.0').children().not('#close').fadeTo('fast', '1.0')
        });
        popup.find('.popup-actions-impexp').click(function () { ImportExport(popup); });
        popup.find('.popup-actions-toggledesc').click(function () {
          var hideDesc = GetStorage('hide-desc') || "show";
          SetStorage('hide-desc', hideDesc == "show" ? "hide" : "show");
          ShowHideDescriptions(popup);
        });
        //Handle remote url & welcome
        SetupRemoteBox(popup);
        SetupWelcomeBox(popup);

        //on submit, convert html to markdown and copy to comment textarea
        popup.find('.popup-submit').click(function () {
          var selected = popup.find('input:radio:checked');
          var markdown = htmlToMarkDown(selected.parent().find('.action-desc').html()).replace(/\[username\]/g, username).replace(/\[OP\]/g, OP);
          $('#' + divid).find('textarea').val(markdown).focus();  //focus provokes character count test
          var caret = markdown.indexOf('[type here]')
          if(caret >= 0) $('#' + divid).find('textarea')[0].setSelectionRange(caret, caret + '[type here]'.length);
          popup.fadeOutAndRemove();
        });

        //Auto-load from remote if required
        if(!window.VersionChecked && GetStorage("AutoRemote") == 'true') {
          var throbber = popup.find("#throbber2");
          var remoteerror = popup.find('#remoteerror2');
          throbber.show();
          LoadFromRemote(GetStorage("RemoteUrl"),
            function () { WriteComments(popup); throbber.hide(); },
            function (d, msg) { remoteerror.text(msg); });
        }

        //check if we need to show announcement
        //Timing issues here: if we put this before remote code, data from announcement and remote get mixed up
        //if(!window.VersionChecked) CheckForAnnouncement(popup); //commented out, this has to be dismissed on every site - not a good idea!

        //add popup and center on screen
        $('#' + divid).append(popup);
        popup.center();
        StackExchange.helpers.bindMovablePopups();

        //Get user info and inject
        var userid = getUserId($(this));
        getUserInfo(userid, popup);
        OP = getOP();

        //We only actually perform the updates check when someone clicks, this should make it less costly, and more timely
        //also wrap it so that it only gets called the *FIRST* time we open this dialog on any given page (not much of an optimisation).
        if(!window.VersionChecked) { CheckForNewVersion(popup); window.VersionChecked = true; }
      }));
      setTimeout(function() {
        $('#' + divid).find('.comment-help-link').parent().append(newspan);
      }, 15);
    });
  });
});
