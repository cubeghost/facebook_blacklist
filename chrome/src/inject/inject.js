function list_check(data,list,cw_only) {

    var matches = []; 

    $.each(list,function(index,value){ // loop through blacklist

        if (data.indexOf(value) !== -1) { // if post contains current item on blacklist

            if (cw_only == true) { // if cw only is enabled
                
                if ((data.indexOf('cw') !== -1) || (data.indexOf('tw') !== -1)) { // if post contains "cw" or "tw"
                    
                    matches.push(value); // add blacklist item to array
                
                }

            } else if (cw_only == false) { // if cw only isn't enabled
            
                matches.push(value); // add blacklist item to array
            
            }

        }
        
    });

    return matches;

}

function check_posts(blacklist,cw_only,showtext) {

    $('._5v3q').not('.blacklisted').each(function(){ // loop through facebook posts

        var post = $(this).find('._5pbx').html() + $(this).find('._6m3').html() + $(this).find('.plm').html(); // text post + link post + share post
        
        if (post) {
        
            post = post.toLowerCase();

            var match = list_check(post,blacklist,cw_only); // are there matches?

            if (match.length > 0) {
                
                $(this).addClass('blacklisted');
                $(this).find('._46-i').css({'visibility':'hidden'}); // ._5pbx
                $(this).append('<div class="blacklist_4417"> \
                                                    <p>Post matches blacklist: <span>' + match + '</span></p> \
                                                    <a class="show_4417">View post</a> \
                                                </div>');
                var t = $(this).find('._5pbx').outerHeight(true);
                if ($('._5pbx').length > 0) {t = t + 10}
                var h = $(this).find('.mtm').children().outerHeight(true); // image height
                var c = $(this).find('.commentable_item').height(); // comments height
                var s = $(this).find('.plm').height(); // .plm height (share comment?)
                if ($(this).find('.plm').length > 0) {s = s + 22}
                console.log('text height: ' + t);
                console.log('image height: ' + h);
                console.log('comment height: ' + c);
                console.log('share height: ' + s);
                if (showtext == true) {
                    if ($(this).find('.mtm').length == 0) {
                        $(this).find('.blacklist_4417').hide();
                        $(this).parent().parent().find('._46-i').css({'visibility':'visible'});
                        console.log('text only show text');
                    }
                    $(this).find('.blacklist_4417').css({'height':(h + s - 18) + 'px','margin-top':'-' + (h + s + c - 80) + 'px','margin-bottom':(c - 94) + 'px'});
                } else {
                    $(this).find('.blacklist_4417').css({'height':(h + t + s - 18) + 'px','margin-top':'-' + (h + t + s + c - 80) + 'px','margin-bottom':(c - 94) + 'px'});
                }
                $(this).on('click','.show_4417',function(){
                    $(this).parent().parent().find('._5pbx, ._46-i').css({'visibility':'visible'});
                    $(this).parent('.blacklist_4417').hide();
                });

            }
        
        }


    });

}

function facebook_blacklist() {
    
    if (!$('#blacklist_container').length) {
        $('#pagelet_rhc_footer').before('<div class="_4-u2 _3-96" id="blacklist_container"><div class="_4-u3 _5dwa _5dwb"><span class="_38my">Blacklist</span></div><div class="_4-u3 _2ph_"><div><div class="_4t37" style="width:100%">\
        <span>Enter your blacklist as a comma-separated list</span>\
        <input type="text" id="blacklist" value=""><br>\
        <label for="cw"><input type="checkbox" id="cw">only blacklist if post contains "cw" or "tw"</label><br>\
        <label for="showtext"><input type="checkbox" id="showtext">show post text</label><br>\
        <a class="_42ft _4jy0 _59x2 _4jy3 _517h _51sy save_4417">Save</a>\
        <span class="status_4417"></span></div></div></div></div>');
    }
       
    $('.save_4417').click(function(){

        var bl = $('input#blacklist').val().replace(/,\s*/g,',');
        var cw = $('input#cw').prop('checked');
        var st = $('input#showtext').prop('checked');
        chrome.storage.sync.set({
            'blacklist_data': bl,
            'only_blacklist_cw': cw,
            'show_post_text': st
        });
        
        $('span.status_4417').text('Blacklist saved. Refresh to apply changes.').addClass('active');
        
    });
    
    $('#blacklist_container ._5dwa').click(function(){
        if ($(this).parent().hasClass('hidden')) {
            $(this).removeClass('closed');
            $(this).next('._2ph_').slideDown(200,function(){
                $(this).parent().removeClass('hidden');
            });
            chrome.storage.sync.set({'blacklist_collapsed':false});
        } else {
            $(this).addClass('closed');
            $(this).next('._2ph_').slideUp(200,function(){
                $(this).parent().addClass('hidden');
            });
            chrome.storage.sync.set({'blacklist_collapsed':true});
        }
    });

    var blacklist = [];
    var cw_only;

    chrome.storage.sync.get({'blacklist_data':'nsfw','only_blacklist_cw':false,'show_post_text':false,'blacklist_collapsed':false}, function(items) {

        var bl = items.blacklist_data;
        var cw = items.only_blacklist_cw;
        var st = items.show_post_text;
        var collapsed = items.blacklist_collapsed;
        
        //console.log('blacklist: ' + bl);
        //console.log('cw only mode: ' + cw);
        //console.log('show post text: ' + cw);
        
        $('input#blacklist').val(bl);
        $('input#cw').prop('checked',cw);
        $('input#showtext').prop('checked',st);
        
        if (collapsed) {
            $('#blacklist_container ._5dwa').addClass('closed');
            $('#blacklist_container ._5dwa').parent().addClass('hidden');
            $('#blacklist_container ._5dwa').next('._2ph_').hide();
        }
        
        /*if (!bl) {
            chrome.storage.sync.set({'blacklist_data': '','only_blacklist_cw': false});
        } else {*/
            if (bl.indexOf(',') !== -1) {
                blacklist = bl.split(',');
            } else if (bl == '') {
                blacklist = [];
            } else {
                blacklist.push(bl);
            }
        //}

        check_posts(blacklist,cw,st);

    });

}

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.pageload == 'load') {
        
        console.log('loading');
        setTimeout(facebook_blacklist,400);
        
    } else if (request.pageload == 'history') {
        
        console.log('history state change');
        setTimeout(facebook_blacklist,400);
    
    }
});

console.log('initializing facebook blacklist');