var pagers = null;
var add_recipient = null;
var remove_recipient = null;
var numeric_recipient = null;

add_recipient = function() {
    var key = $(this).data('pagerid').toString();
    var txt = (key in pagers) ? pagers[key] + ' [' + key.slice(-4) + ']' : key;
    var a = $('<a data-pagerid="' + key + '" href="#">' + txt + '</a>');
    var li = $('<li id="' + key + '" data-icon="delete"></li>');
    a.click(remove_recipient);
    li.append(a);
    $(this).remove();
    $('#selected-recipients').append(li);
    $('#selected-recipients').listview('refresh');
    $('#unselected-recipients').listview('refresh');
    $('div.ui-input-search > input').val('').trigger('change');
    return false;
};

remove_recipient = function() {
    var key = $(this).data('pagerid').toString();
    $('#' + key).remove();
    if (key in pagers) {
        var txt = pagers[key] + ' [' + key.slice(-4) + ']';
        var a = $('<a data-pagerid="' + key + '" href="#">' + txt + '</a>');
        var li = $('<li id="' + key + '" data-filtertext="' + key + ' ' + pagers[key] + '"></li>');
        a.click(add_recipient);
        li.append(a);
        $('#unselected-recipients').append(li);
        $('#unselected-recipients').listview('refresh');
    }
    $('#selected-recipients').listview('refresh');
    return false;
};

numeric_recipient = function() {
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
        var a = $('<a data-pagerid="' + key + '" href="#">' + txt + '</a>');
        var li = $('<li id="' + key + '" class="numrec" data-filtertext="' + key + '"></li>');
        a.click(add_recipient);
        li.append(a);
        $('#unselected-recipients').append(li);
    } else {
        $('.numrec').remove();
    }
    
    $('#unselected-recipients').listview('refresh');
}

$(document).delegate('#pagingpage', 'pageinit', function() {
    $.getJSON('pagers.json').done(function(data) {
        pagers = data;
        $.each(pagers, function(key, val) {
            var txt = pagers[key] + ' [' + key.slice(-4) + ']';
            var a = $('<a data-pagerid="' + key + '" href="#">' + txt + '</a>');
            var li = $('<li id="' + key + '" data-filtertext="' + key + ' ' + val + '"></li>');
            a.click(add_recipient);
            li.append(a);
            $('#unselected-recipients').append(li);
        });
    });
    
    $('#unselected-recipients').listview('refresh');   
    $('div.ui-input-search > input').on('input', numeric_recipient);
});

