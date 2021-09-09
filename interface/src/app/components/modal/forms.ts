
const regex = {
	'name': /^[a-zA-Z ]+$/,
	'email': /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
	'password': /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[/#$&])[A-Za-z\d/#$&]{8,}$/
}

export const edit_profile : any = [
	{
		'name' : 'Nombre',
		'type': 'text',
		'show' : true,
		'validations': {
			'required': true,
			'type': 'regex',
			'value': regex['name'],
		},
	},{
		'name' : 'Apellido',
		'type': 'text',
		'show' : true,
		'validations':{
			'required': true,
			'type': 'regex',
			'value': regex['name'],
		},
	},{
		'name' : 'Fecha de nacimiento',
		'type': 'date',
		'show' : true,
		'validations': {
			'required': true
		},
	},{
		'name': 'Genero',
		'type': "radio",
		'show' : true,
		'options': [['Masculino','M'], ['Femenino','F']],
		'validations': {
			'required': true,
		}
	},{
		'name': 'Correo',
		'type': 'email',
		'show' : true,
		'validations': {
				'required': true,
				'regex': regex['email'],
			}
	},{
		'name': 'Confirmar correo',
		'type': 'email',
		'show' : true,
		'validations': {
			'same': 'Correo',
			'required': true
		}
	},{
		'name': 'Contraseña',
		'type': 'password',
		'show' : false,
		'validations': {
			'required' : false,
			'regex': regex['password']
		}
	},{
		'name': 'Confirmar contraseña',
		'type': 'password',
		'show' : false,
		'validations': {
			'required' : false,
			'same': 'password'
		}
	},{
		'name': 'Cambiar contraseña',
		'type': 'button',
		'action':'show_field',
		'fields': ['password', 'password_check']
	}
]