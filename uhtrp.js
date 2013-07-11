var UHTRP_Paging = {};
(function() {
    var MAX_RECIPIENTS = 10;
    var MAX_CHARACTERS = 240;
    var num_recipients = 0;
    var num_characters = 0;
    var pagers = {};

    var toggle_send_button = function() {
        if ((num_recipients > 0) && (num_characters > 0))
            $('#send').removeClass('ui-disabled');
        else
            $('#send').addClass('ui-disabled');
    };

    this.initialize_pagers = function(obj) {
        pagers = obj;
    };

    this.add_recipient = function(evt) {
        var key = $(this).attr('id').toString();
        var txt = (key in pagers) ? pagers[key] + ' [' + key.slice(-4) + ']' : key;
        var li = $('<li id="' + key + '" data-icon="delete"><a href="#">' + txt + '</a></li>');
        li.click(evt.data, evt.data.remove_recipient);
        $(this).remove();
        $('#unselected-recipients').listview('refresh');
        $('#selected-recipients').append(li).listview('refresh');
        $('div.ui-input-search > input').val('').trigger('change');
        num_recipients = $('#selected-recipients > li').length;
        if (num_recipients >= MAX_RECIPIENTS)
            $('div.ui-input-search > input').val('Maximum number of recipients reached!').textinput('disable');
        toggle_send_button();
        return false;
    };

    this.remove_recipient = function(evt) {
        var key = $(this).attr('id').toString();
        $('#' + key).remove();
        $('#selected-recipients').listview('refresh');
        if (key in pagers) {
            var txt = pagers[key] + ' [' + key.slice(-4) + ']';
            var li = $('<li id="' + key + '" data-icon="plus" data-filtertext="' + key + ' ' + pagers[key] + '"><a href="#">' + txt + '</a></li>');
            li.click(evt.data, evt.data.add_recipient);
            $('#unselected-recipients').append(li).listview('refresh');
        }
        num_recipients = $('#selected-recipients > li').length;
        $('div.ui-input-search > input').val('').textinput('enable').trigger('change');
        toggle_send_button();
        return false;
    };

    this.numeric_recipient = function(evt) {
        var tendigit = /^\d{10}$/;
        var sevendigit = /^\d{7}$/;
        var fourdigit = /^\d{4}$/;
        var key = null;

        if (fourdigit.test($(this).val()))
            key = '808577' + $(this).val();
        else if (sevendigit.test($(this).val()))
            key = '808' + $(this).val();
        else if (tendigit.test($(this).val()))
            key = $(this).val().toString();

        if ((key !== null) && ($('#' + key).length == 0)) {
            var txt = key;
            var li = $('<li id="' + key + '" class="numrec" data-icon="plus" data-filtertext="' + key + '"><a href="#">' + txt + '</a></li>');
            li.click(evt.data, evt.data.add_recipient);
            $('#unselected-recipients').append(li);
        } else {
            $('.numrec').remove();
        }

        $('#unselected-recipients').listview('refresh');
        return false;
    }

    this.count_characters = function(evt) {
        $(this).val($(this).val().substring(0, MAX_CHARACTERS));
        num_characters = $(this).val().length;
        var rem = MAX_CHARACTERS - num_characters;
        var red = Math.round(255 * num_characters / MAX_CHARACTERS);
        $('#charcount').text(rem + ' characters remaining').css('color', 'rgb(' + red + ',0,0)');
        toggle_send_button();
        return false;
    };

}).apply(UHTRP_Paging);


$(document).delegate('#pagingpage', 'pageinit', function() {
    $.getJSON('pagers.json').done(function(data) {
        UHTRP_Paging.initialize_pagers(data);
        $.each(data, function(key, val) {
            var txt = data[key] + ' [' + key.slice(-4) + ']';
            var li = $('<li id="' + key + '" data-icon="plus" data-filtertext="' + key + ' ' + val + '"><a href="#">' + txt + '</a></li>');
            li.click(UHTRP_Paging, UHTRP_Paging.add_recipient);
            $('#unselected-recipients').append(li);
        });
        $('#unselected-recipients').listview('refresh');
        $('div.ui-input-search > input').on('input', UHTRP_Paging, UHTRP_Paging.numeric_recipient).trigger('input');
    });

    $('#message').on('input', UHTRP_Paging, UHTRP_Paging.count_characters).trigger('input');
});

