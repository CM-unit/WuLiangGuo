function check_form(form_id) {
	last_submit = $('#' + form_id).data('last_submit');
	current_submit = new Date().getTime();
	if (last_submit == undefined) {
		$('#' + form_id).data('last_submit', new Date().getTime());
	} else {
		if (current_submit - last_submit > 600) {
			$('#' + form_id).data('last_submit', new Date().getTime());
		} else {
			return false;
		}
	}
	if ( typeof (tinyMCE) != 'undefined') {
		tinyMCE.triggerSave(true);
	}

	var check_flag = true;
	$("#" + form_id + " :input").each(function(i) {
		if ($(this).attr("check")) {
			if (!validate($(this).val(), $(this).attr("check"))) {
				ui_error($(this).attr("msg"));
				$(this).focus();
				check_flag = false;
				return check_flag;
			}
		}
	});
	return check_flag;
}

/* 验证数据类型*/
function validate(data, datatype) {
	if (datatype.indexOf("|")) {
		tmp = datatype.split("|");
		datatype = tmp[0];
		data2 = tmp[1];
	}
	switch (datatype) {
	case "require":
		if (data == "") {
			return false;
		} else {
			return true;
		}
		break;
	case "email":
		var reg = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g;
		return reg.test(data);
		break;
	case "number":
		var reg = /^[0-9]+\.{0,1}[0-9]{0,3}$/;
		return reg.test(data);
		break;
	case "html":
		var reg = /<...>/;
		return reg.test(data);
		break;
	case "eqt":
		data2 = $("#" + data2).val();
		return data >= data2;
		break;
	}
}

/* ajax提交*/
function sendAjax(url, vars, callback) {
	return $.ajax({
		type : "POST",
		url : url,
		data : "&par=" + vars + "&ajax=1",
		dataType : "json",
		success : callback
	});
}

/**
 * 提交表单
 * @param  {string} formId     表单id
 * @param  {string} post_url   目的url
 * @param  {string} return_url 返回url
 * @return {json}              data
 */
function sendForm(formId, post_url, return_url) {
	if (check_form(formId)) {
		//绑定beforeunload事件
		$(window).unbind('beforeunload', null);
		if ($("#ajax").val() == 1) {
			var vars = $("#" + formId).serialize();
			$.ajax({
				type : "POST",
				url : post_url,
				data : vars,
				dataType : "json",
				success : function(data) {
					console(data);
					if (data.status) {
						ui_alert(data.info, function() {
							if (return_url) {
								location.href = return_url;
							}
						});
					} else {
						ui_error(data.info);
					}
				}
			});
		} else {
			$("#" + formId).attr("action", post_url);
			if (return_url) {
				// set_cookie('return_url', return_url);
			}
			$("#" + formId).submit();
		}
	}
}

/*设置 cookie*/
function set_cookie(key, value, exp, path, domain, secure) {
	key = cookie_prefix + key;
	path = "/";
	var cookie_string = key + "=" + escape(value);
	if (exp) {
		cookie_string += "; expires=" + exp.toGMTString();
	}
	if (path)
		cookie_string += "; path=" + escape(path);
	if (domain)
		cookie_string += "; domain=" + escape(domain);
	if (secure)
		cookie_string += "; secure";
	document.cookie = cookie_string;
}

/*读取 cookie*/
function get_cookie(cookie_name) {
	cookie_name = cookie_prefix + cookie_name;
	var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
	if (results)
		return (unescape(results[2]));
	else
		return null;
}

/*删除 cookie*/
function del_cookie(cookie_name) {
	cookie_name = cookie_prefix + cookie_name;
	var cookie_date = new Date();
	//current date & time
	cookie_date.setTime(cookie_date.getTime() - 1);
	document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}