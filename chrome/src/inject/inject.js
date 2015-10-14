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

function check_posts(blacklist,cw_only,hide_reason) {

    $('._4-u2').not('.blacklisted').each(function(){ // loop through facebook posts

        var post = $(this).find('._5pbx').html() + $(this).find('._6m3').html() + $(this).find('.plm').html(); // text post + link post + share post
        
        if (post) {
        
            post = post.toLowerCase();

            var match = list_check(post,blacklist,cw_only); // are there matches?
            var hide_class = hide_reason ? 'hide_reason' : '';

            if (match.length > 0) {
                                                
                $(this).addClass('blacklisted');
                $(this).find('._5pcp').eq(0).append(' \u00B7 <span class="blacklist_4418">post matches blacklist<span class="'+hide_class+'">: </span><span class="'+hide_class+'">' + match + '</span></span> \u00B7 <a class="show_4418">show post</a>');
                $(this).on('click','.show_4418',function(){
                    var $parent =  $(this).parents('._4-u2');
                    if (!$parent.hasClass('showpost')) {
                        $(this).text('hide post');
                        $parent.addClass('showpost');
                    } else {
                        $(this).text('show post');
                        $parent.removeClass('showpost');
                    }
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
        <label for="hide_reason"><input type="checkbox" id="hide_reason">show matched words</label><br>\
        <label for="hidetrending"><input type="checkbox" id="hidetrending">hide trending stories</label><br>\
        <a class="_42ft _4jy0 _59x2 _4jy3 _517h _51sy save_4418">Save</a>\
        <span class="status_4418"></span></div></div></div></div>');
    }
       
    $('.save_4418').click(function(){

        var bl = $('input#blacklist').val().replace(/,\s*/g,',');
        var cw = $('input#cw').prop('checked');
        var hr = $('input#hide_reason').prop('checked');
        var ht = $('input#hidetrending').prop('checked');
        chrome.storage.sync.set({
            'blacklist_data': bl,
            'only_blacklist_cw': cw,
            'hide_reason': hr,
            'hide_trending': ht
        });
        
        $('span.status_4418').text('Blacklist saved. Refresh to apply changes.').addClass('active');
        
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

    chrome.storage.sync.get({'blacklist_data':'nsfw','only_blacklist_cw':false,'hide_reason':false,'hide_trending':false,'blacklist_collapsed':false}, function(items) {

        var bl = items.blacklist_data;
        var cw = items.only_blacklist_cw;
        var hr = items.hide_reason;
        var ht = items.hide_trending;
        var collapsed = items.blacklist_collapsed;
                
        $('input#blacklist').val(bl);
        $('input#cw').prop('checked',cw);
        $('input#hide_reason').prop('checked',hr);
        $('input#hidetrending').prop('checked',ht);
        
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
        
        if (ht) {
            $('#pagelet_trending_tags_and_topics').hide();
        }
        
        check_posts(blacklist,cw,hr);

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
