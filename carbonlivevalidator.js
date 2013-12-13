/******************************************
 * Carbon Live Validator
 *
 * A jQuery plugin that does live, client-side form validation.
 *
 * Built and tested with jQuery 1.8.3.
 *
 * @author          Scott A. Murray <design@carbonvictory.com>
 * @copyright       Copyright (c) 2013 Carbon Victory
 * @license         http://opensource.org/licenses/MIT
 * @link            https://github.com/carbonvictory/xxx
 * @docs            https://github.com/carbonvictory/xxx/blob/master/readme.md
 * @version         Version 0.9.9
 ******************************************/
 
;(function($) {
	
	$.fn.liveValidate = function(options) {
		var settings = $.extend({}, $.fn.liveValidate.defaultSettings, options || {});
		
		/**
		 * Create and init an instance of the validator object.
		 */
		var validator = new Validator(settings, this);
		validator.start();
		
		/**
		 * Bind individual validation to inputs and textareas.
		 */
		this.on('blur', 'input, textarea', function() {
			validator.validate(this);
		});
		
		/**
		 * Bind individual validation to checkboxes, radio buttons, and 
		 * select boxes.
		 */
		this.on('change', '[type=checkbox], [type=radio], select', function() {
			validator.validate(this);
		});
		
		/**
		 * If eagerValidateLastField is set to true, bind validation of
		 * the entire form to the last required field's keyup event
		 * (see default parameters, below).
		 */
		if (validator.settings.eagerValidateLastField) {
			$('input[required]:not(:disabled)').last().on('keyup', function(event) {
				if (event.which != 9) // ignore tabbing into the field
					validator.validateForm();
			});
		}
		
		/**
		 * Prevent submission of invalid forms.
		 * Also handles submission events for valid forms.
		 */
		return this.bind('submit', function(event) {
			event.preventDefault(event);
			
			if (validator.formIsValid()) {
				if (validator.settings.disableSubmit)
					$('input[type=submit]').prop('disabled', true);
					
				if (typeof(validator.settings.onSubmit) === 'function')
					validator.settings.onSubmit(this);
					
				this.submit();
			} else {
				validator.onFailedValidation();
			}
		});
	};
	
	/**
	 * Stores the default parameters for the Validator plugin.
	 *
	 * {boolean} disableSubmit If true, the form submit button will be disabled
	 *     while the form is invalid.
	 * {boolean} eagerValidateLastField If true, the form will validate itself
	 *     whenever a key is pressed while the last required field is in focus.
	 *     This is due to the observed behavior of users not clicking or tabbing
	 *     out of the final required field, expecting it to validate when they
	 *     are done typing something in.
	 * {function} onInit A function that runs when the form is loaded. Accepts
	       the entire form element as its only parameter.
	 * {function} beforeFieldValidation A function that runs before an individual
	 *     form field is validated. Accepts the individual form field element as
	 *     its only parameter.
	 * {function} afterFieldValidation A function that runs after an individual
	 *     form field is validated. Function takes the form field element, the
	 *     validation result (boolean), and the warning message as parameters.
	 * {function} beforeFormValidation A function that runs before the entire
	 *     form is validated. Accepts the entire form element as its only parameter.
	 * {function} onSuccessfulValidation A function that runs after the entire
	 *     form is validated and found to be valid. Accepts the entire form element
	 *     as its only parameter.
	 * {function} onFailedValidation A function that runs after the entire form
	 *     is validated and found to be invalid. Accepts the entire form element
	 *     as its only parameter.
	 * {function} onSubmit A function that runs when the user submits a valid
	 *     form, but before the request is sent off to the server. Accepts the
	 *     entire form element as its only parameter.
	 */
	$.fn.liveValidate.defaultSettings = {
		'disableSubmit': true,
		'eagerValidateLastField': true,
		'onInit': null,
		'beforeFieldValidation': null,
		'afterFieldValidation': null,
		'beforeFormValidation': null,
		'onSuccessfulValidation': null,
		'onFailedValidation': null,
		'onSubmit': null
	};
	
	/**
	 * Defines the plugin's preset validation rules.
	 */
	$.fn.liveValidate.validationRules = {
		'empty': function(value) {
			return (value.length === 0);
		},
		
		'required': function(value) {
			return (value.length > 0);
		},
		
		'alphanumeric': function(value) {
			return /^[\w]+$/gi.test(value) || this.empty(value);
		},
		
		'alphabetic': function(value) {
			return /^[A-z]+$/gi.test(value) || this.empty(value);
		},
		
		'numeric': function(value) {
			return /^[\d\.]+$/g.test(value) || this.empty(value);
		},
		
		'email': function(value) {
			return /^[\w\.\-]+\@[\w\.\-]+\.[A-z\.]{2,}$/gi.test(value) || this.empty(value);
		},
		
		'zip': function(value) {
			return /^\d{5}(-\d{4})?$/g.test(value) || this.empty(value);
		},
		
		'state_usa': function(value) {
			return /^[A-z]{2}$/g.test(value) || this.empty(value);
		},
		
		'phone_usa': function(value) {
			return /^(\()?\d{3}(\))?[\.\-\s]\d{3}[\.\-\s]\d{4}$/g.test(value) || this.empty(value);
		},
		
		'date': function(value) {
			return /^(\d{4}[\/\-]\d{1,2}[\/\-]{1,2}\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2}(\d{2})?)$/g.test(value) || this.empty(value);
		},
		
		'year': function(value) {
			return /^\d{4}$/g.test(value) || this.empty(value);
		},
		
		'url': function(value) {
			return /^((http|ftp|https):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?$/.test(value) || this.empty(value);
		},
		
		'money_usa': function(value) {
			return /^\d+\.\d{2}$/g.test(value) || this.empty(value);
		},
		
		'money_euro': function(value) {
			return /^\d+\,\d{2}$/g.test(value) || this.empty(value);
		},
		
		'creditcard': function(value) {
			return /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/g.test(value) || this.empty(value);
		},
		
		'matches': function(value, fieldToMatch) {
			return (value === $('[name="' + fieldToMatch + '"]').val()) || this.empty(value);
		},
		
		'different': function(value, fieldToAvoid) {
			return (value !== $('[name="' + fieldToAvoid + '"]').val()) || this.empty(value);
		},
		
		'min': function(value, minValue) {
			if (this.empty(value))
				return true;
			
			if ( ! this.numeric(value))
				return false;
				
			return parseInt(value) >= parseInt(minValue);
		},
		
		'max': function(value, maxValue) {
			if (this.empty(value))
				return true;
			
			if ( ! this.numeric(value))
				return false;
				
			return parseInt(value) <= parseInt(maxValue);
		},
		
		'range': function(value, valueRange) {
			if (this.empty(value))
				return true;
			
			if ( ! this.numeric(value))
				return false;
			
			value = parseInt(value);
			valueRange = valueRange.split(',');
			valueRange[0] = parseInt(valueRange[0]);
			valueRange[1] = parseInt(valueRange[1]);
			
			return value >= valueRange[0] && value <= valueRange[1];
		},
		
		'between': function(value, valueRange) {
			if (this.empty(value))
				return true;
			
			if ( ! this.numeric(value))
				return false;
				
			value = parseInt(value);
			valueRange = valueRange.split(',');
			valueRange[0] = parseInt(valueRange[0]);
			valueRange[1] = parseInt(valueRange[1]);
			
			return value > valueRange[0] && value < valueRange[1];
		},
		
		'minlength': function(value, minLength) {
			return (value.length >= minLength) || this.empty(value);
		},
		
		'maxlength': function(value, maxLength) {
			return (value.length <= maxLength) || this.empty(value);
		},
		
		'list': function(value, acceptedValues) {
			return ($.inArray(value, acceptedValues.split(',')) > -1) || this.empty(value);
		},
		
		'excludes': function(value, forbiddenValues) {
			return ($.inArray(value, forbiddenValues.split(',')) === -1) || this.empty(value);
		},
		
		'accepted': function(value) {
			return $('[value="' + value + '"]').prop('checked');
		},
		
		'before': function(value, cutoffDate) {
			return (new Date(value).getTime() < new Date(cutoffDate).getTime()) || this.empty(value);
		},
		
		'after': function(value, startDate) {
			return (new Date(value).getTime() > new Date(startDate).getTime()) || this.empty(value);
		}
	};
	
	/**
	 * Sets default error messages for the plugin's preset validation rules.
	 *     Placeholders in the messages (ex. {0}, {1}) are replaced by the
	 *     specific parameter values in Validator.formatWarningMessage().
	 *
	 *     It's recommended that you define custom warning messages for 
	 *     each of your fields.
	 */
	$.fn.liveValidate.warningMessages = {
		'base': 'Sorry, but there is a problem with this field.',
		'required': 'Sorry, but this field is required.',
		'alphanumeric': 'Sorry, but this field may only contain letters and numbers.',
		'alphabetic': 'Sorry, but this field may only contain letters.',
		'numeric': 'Sorry, but this field may only contain numbers.',
		'email': "Please enter a valid email address (ex. 'mailbox@example.com').",
		'zip': "Please enter a valid ZIP code (ex. '60614').",
		'state_usa': "Please enter a valid state abbreviation (ex. 'IL').",
		'date': "Please enter a valid date (ex. '1/1/2013').",
		'year': 'Please enter a valid year.',
		'url': "Please enter a valid URL (ex. 'http://google.com').",
		'money_usa': "Please enter a valid dollar amount (ex. '5.99').",
		'money_euro': "Please enter a valid Euro amount (ex. '5,99').",
		'creditcard': 'Please enter a valid 16-digit credit card number.',
		'matches': 'Sorry, but this field must match {0}.',
		'different': 'Sorry, but this field must be different from {0}.',
		'min': 'Please enter a value greater than or equal to {0}.',
		'max': 'Please enter a value less than or equal to {0}.',
		'range': 'Please enter a value no less than {0} and no more than {1}.',
		'between': 'Please enter a value between {0} and {1}.',
		'minlength': 'Sorry, but this needs to be at least {0} characters long.',
		'maxlength': 'Sorry, but this must be {0} characters or less.',
		'before': 'Please choose a date before {0}.',
		'after': 'Please choose a date after {0}.',
		'accepted': 'Sorry, but you must accept these terms.'
	};
	
	/**
	 * Initializes the Validator object.
	 */
	function Validator(settings, form) {
        this.form = form;
		this.form.errors = {};
		this.fieldBeingValidated = {};
		this.settings = settings;
		this.validationRules = $.extend({}, $.fn.liveValidate.validationRules, settings.validationRules || {});
		this.warningMessages = $.extend({}, $.fn.liveValidate.warningMessages, settings.warningMessages || {});
		
		return this;
	};
	
	/**
	 * The Validator plugin prototype.
	 */
	Validator.prototype = {
		/**
		 * Runs when the validator is switched on, before any events are
		 *     bound to any form fields. To modify what gets executed on startup,
		 *     don't edit this function - pass an option containing a closure 
		 *     called onInit to the plugin settings instead.
		 */
		start: function() {
			if (typeof(this.settings.onInit) === 'function')
				this.settings.onInit(this.form);
				
			if (this.settings.disableSubmit)
				$(this.form).find('input[type=submit]').prop('disabled', true);
				
			this.validateForm();
		},
		
		/**
		 * Caches the properties and value of the currently-being-validated 
		 *     form field for (re-)use in the validation functions.
		 * @param {object} formElement The form field element being validated.
		 */
		setCurrentField: function(formElement) {
			this.fieldBeingValidated = {
				'id': $(formElement).attr('id'),
				'name': $(formElement).attr('name'),
				'value': $(formElement).val(),
				'$elem': $(formElement)
			};
		},
		
		/**
		 * Clears the currently-being-validated form field data.
		 */
		unsetCurrentField: function() {
			this.fieldBeingValidated = {};
		},
	
		/**
		 * Prepares a form field for validation if rules have been set for it.
		 *     Also calls the before- and after-validation functions.
		 * @param {object} formElement The form field element being validated.
		 */
		validate: function(formElement) {
			this.setCurrentField(formElement);
			
			if (typeof(this.settings.rules[this.fieldBeingValidated.name]) === 'undefined') {
				this.validateForm();
				return;
			}
			
			this.beforeFieldValidation();
			var isValid = this.validateField();
			this.afterFieldValidation(isValid);
			
			this.unsetCurrentField(formElement);
		},
	
		/**
		 * Determines whether or a particular value for the field is valid 
		 *     or not given the declared rule(s). Rules can be either a 
		 *     pipe-delimited string of constraints (see readme.md) or a 
		 *     closure that MUST return true or false.
		 * @return {boolean} Whether or not the form field is valid.
		 */
		validateField: function() {
			var rule = this.settings.rules[this.fieldBeingValidated.name];
			
			switch(typeof(rule)) {
				case 'function':
					return this.validateCustomRule(rule);
				case 'string': 
					return this.validatePresetRule(rule);
				default:
					return false;
			}
		},
		
		/**
		 * Validates a form field using a preset rule.
		 * @param {string} rule The name of the rule(s) being validated against.
		 * @return {boolean} Whether or not the form field is valid.
		 */
		validatePresetRule: function(rule) {
			var value = this.fieldBeingValidated.value;
			var isValid = true;
			
			var rules = rule.split('|');
			
			for (var i = 0; i < rules.length; ++i) {
				var currentRule = this.extractRuleParam(rules[i]);
				
				if ( ! this.validationRules[currentRule.name](value, currentRule.params)) {
					isValid = false;
					this.raiseError(currentRule);
				}
			}
			
			if (isValid) this.removeError();
			return isValid;
		},
		
		/**
		 * Validates a form field using a custom rule (closure).
		 * @param {function} rule A closure containing validation logic.
		 * @return {boolean} Whether or not the form field is valid.
		 */
		validateCustomRule: function(rule) {
			var value = this.fieldBeingValidated.value;
			var isValid = rule(value);
			
			if (isValid) {
				this.removeError();
			} else {
				this.raiseError(null);
			}
			
			return (typeof(isValid) === 'boolean') ? isValid : false;
		},
		
		/**
		 * Some rules require parameters, which are defined by attaching a
		 *     params block '(:param)' to the end of the rule declaration.
		 *     This function extracts the parameters and returns an object
		 *     containing the bare rule name and the extracted param(s).
		 * @param {string} rule The rule name with attached params block.
		 * @return {object} Returns an object containing the bare rule name
		 *     and the extracted param(s). Each rule is responsible for
		 *     handling the returned param(s) on its own.
		 */
		extractRuleParam: function(rule) {
			var paramRegex = /\(\:[\w\-\,]+\)$/gi;
			var paramToken = rule.match(paramRegex);
			
			return {
				'name': rule.replace(paramRegex, ''),
				'params': (paramToken === null) ? null : paramToken[0].replace(/[^\w\-\,]/g, '')
			}
		},
		
		/**
		 * Runs before a form field is validated. To modify what gets executed 
		 *     before field validation, don't edit this function - edit or 
		 *     overwrite $.defaultSettings.beforeFieldValidation instead.
		 */
		beforeFieldValidation: function() {
			if (typeof(this.settings.beforeFieldValidation) === 'function')
				this.settings.beforeFieldValidation(this.fieldBeingValidated.$elem);
		},
		
		/**
		 * Runs after a form field is validated. To modify what gets executed 
		 *     before field validation, don't edit this function - edit or 
		 *     overwrite $.defaultSettings.afterFieldValidation instead.
		 * @param {boolean} validationResult Was the form field valid?
		 */
		afterFieldValidation: function(validationResult) {
			if (typeof(this.settings.afterFieldValidation) === 'function') {
				var id = this.fieldBeingValidated.id;
				
				var message = (typeof(this.form.errors[id]) !== 'undefined') 
					? this.form.errors[id].message 
					: null;
				
				this.settings.afterFieldValidation(
					this.fieldBeingValidated.$elem, 
					validationResult, 
					message
				);
			}
			
			this.validateForm();
		},
		
		/**
		 * Register an error with the form.
		 * @param {object} rule The rule being validated against.
		 */
		raiseError: function(rule) {
			var elementID = this.fieldBeingValidated.id;
			var fieldName = this.fieldBeingValidated.name;
			var warningMessage = this.warningMessages.base;
			
			if (typeof(this.warningMessages[fieldName]) !== 'undefined') {
				warningMessage = this.warningMessages[fieldName];
			} else {
				if (rule !== null) {
					warningMessage = this.formatWarningMessage(
						this.warningMessages[rule.name],
						rule.params
					);
				}
			}
			
			this.form.errors[elementID] = {
				element: this.fieldBeingValidated.$elem,
				message: warningMessage
			}
		},
		
		/**
		 * Accepts a warning message and replaces placeholders in the string
		 * (ex. {0}, {1}) with the validation parameters, in order.
		 * @param {string} message The message string, with placeholders.
		 * @param {string} params The specific rule parameters.
		 */
		formatWarningMessage: function(message, params) {	
			if (params === null)
				return message;
				
			params = params.split(',');
			
			for (var i = 0; i < params.length; i++) {
				message = message.replace(
					'{' + i + '}',
					params[i]
				);
			}
			
			return message;
		},
		
		/**
		 * Removes a registered error from the form.
		 */
		removeError: function() {
			var errorID = this.fieldBeingValidated.id;
			
			if (typeof(this.form.errors[errorID]) !== 'undefined')
				delete this.form.errors[errorID];
		},
		
		/**
		 * Handles validation of the form as a whole. Also calls the before- 
		 *     and -after form validation functions.
		 */
		validateForm: function() {
			this.beforeFormValidation();
		
			if (this.formIsValid()) {
				this.onSuccessfulValidation();
			} else {
				this.onFailedValidation();
			}
		},
		
		/**
		 * Checks whether the entire form is valid.
		 * @return {boolean} Whether or not the form is valid.
		 */
		formIsValid: function() {
			var validator = this;
			var isValid = true;
			
			$(this.form).find('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)').each(function() {
				validator.setCurrentField(this);
				
				if (typeof(validator.settings.rules[validator.fieldBeingValidated.name]) !== 'undefined') {
					if ( ! validator.validateField())
						isValid = false;
				}
			});
			
			validator.unsetCurrentField();
			return isValid;
		},
		
		/**
		 * Runs before the form as a whole is validated. To modify what gets 
		 *     executed before field validation, don't edit this function - 
		 *     instead invoke the plugin with an option containing a function 
		 *     called beforeFormValidation.
		 */
		beforeFormValidation: function() {
			if (typeof(this.settings.beforeFormValidation) === 'function')
				this.settings.beforeFormValidation(this.form);
		},
		
		/**
		 * Runs after the form is successfully validated. To modify what gets 
		 *     executed after successful validation, don't edit this function - 
		 *     instead invoke the plugin with an option containing a function 
		 *     called onSuccessfulValidation.
		 */
		onSuccessfulValidation: function() {
			if (typeof(this.settings.onSuccessfulValidation) === 'function')
				this.settings.onSuccessfulValidation(this.form);
				
			if (this.settings.disableSubmit)
				$('input[type=submit]').prop('disabled', false);
		},
		
		/**
		 * Runs after the form fails validation. To modify what gets executed 
		 *     after a failed validation, don't edit this function - edit or 
		 *     instead invoke the plugin with an option containing a function 
		 *     called onFailedValidation.
		 */
		onFailedValidation: function() {
			if (typeof(this.settings.onFailedValidation) === 'function')
				this.settings.onFailedValidation(this.form);
				
			if (this.settings.disableSubmit)
				$('input[type=submit]').prop('disabled', true);
		}
	};

})( jQuery );