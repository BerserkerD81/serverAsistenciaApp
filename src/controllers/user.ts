import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';


export const newUser = async (req: Request, res: Response) => {
  const { rut, password, rol, nombre, email,carrera } = req.body;

  // Validate email domain
  const validDomains = ['@alumnos.utalca.cl', '@utalca.cl'];
  const emailDomain = email.substring(email.lastIndexOf("@"));
  
  if (!validDomains.includes(emailDomain)) {
      return res.status(400).json({
          msg: 'Correo electrónico no permitido. Debe usar un correo @alumnos.utalca.cl o @utalca.cl'
      });
  }
    // Validar RUT
    const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/;
    if (!rutRegex.test(rut) || !validarRut(rut)) {
      return res.status(400).json({
        msg: 'RUT no válido. Debe estar en el formato xx.xxx.xxx-x y ser un RUT válido'
      });
    }

  const user = await User.findOne({ where: { rut } });

  if (user) {
    return res.status(400).json({
      msg: `Ya existe un usuario con ese rut ${rut}`
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  try {
    await User.create({
      rut,
      password: hashedPassword,
      rol,
      nombre,
      email,
      estado: 'inactivo',
      verificationToken,
      carrera
    });

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Asegúrate de que esta variable esté configurada correctamente
      },
      logger: true, // Activa el registro
      debug: true // Activa la depuración
    });

    const verificationUrl = `https://asistenciadocente.mooo.com/validar/${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verificación de correo electrónico',
      text: `Hola ${nombre},\n\nPor favor, verifica tu correo electrónico haciendo clic en el siguiente enlace:\n${verificationUrl}\n\nGracias!`
    };

    await transporter.sendMail(mailOptions);

    res.json({
      msg: `Usuario ${rut} creado exitosamente! Por favor, verifica tu correo electrónico.`
    });
  } catch (error) {
    console.error('Error enviando correo:', error); // Log para depuración
    res.status(400).json({
      msg: 'Upps ocurrió un error',
      error
    });
  }
};

  
export const loginUser = async (req: Request, res: Response) => {
  const { rut, password } = req.body;

  const user: any = await User.findOne({ where: { rut: rut } });

  if (!user) {
    return res.status(400).json({
      msg: `No existe un usuario con el nombre ${rut} en la base datos`
    });
  }

  if (user.estado !== 'activo') {
    return res.status(400).json({
      msg: `El usuario ${rut} está inactivo y no puede iniciar sesión`
    });
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    return res.status(400).json({
      msg: `Password Incorrecta`
    });
  }

  const token = jwt.sign({
    rut: user.rut,
    rol: user.rol,
    nombre: user.nombre,
    carrera:user.dataValues.carrera
  }, process.env.SECRET_KEY || 'pepito123', 
  {
    expiresIn: '1000000000'
  });

  res.json(token + " " + user.rol);
};

export const configUserAdmin = async (req: Request, res: Response) => {
  const { password, rut, nombre } = req.body;

  const user = await User.findOne({ where: { rut: rut } });

  if (!user) {
    return res.status(400).json({
      msg: `No existe un usuario con ese rut ${rut}`
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.update({
      password: hashedPassword,
      nombre: nombre
    }, { where: { rut: rut } });
    
    res.json({
      msg: `Usuario ${rut} modificado exitosamente!`
    });
  } catch (error) {
    res.status(400).json({
      msg: 'Upps ocurrió un error',
      error
    });
  }
};
export const configUser = async (req: Request, res: Response) => {
  const { oldPassword, password, rut, nombre } = req.body;

  const user = await User.findOne({ where: { rut: rut } });

  if (!user) {
    return res.status(400).json({
      msg: `No existe un usuario con ese rut ${rut}`
    });
  }

  // Verificar si la contraseña anterior coincide
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      msg: 'La contraseña anterior no es válida'
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.update({
      password: hashedPassword,
      nombre: nombre
    }, { where: { rut: rut } });
    
    res.json({
      msg: `Usuario ${rut} modificado exitosamente!`
    });
  } catch (error) {
    res.status(400).json({
      msg: 'Upps ocurrió un error',
      error
    });
  }
};


export const deactivateUser = async (req: Request, res: Response) => {
  const { rut } = req.body;

  try {
    const user = await User.findOne({ where: { rut } });

    if (!user) {
      return res.status(404).json({
        msg: 'Usuario no encontrado'
      });
    }

    let aux: string = "desactivado";
    if (user.dataValues.estado == "activo") {
      aux = 'desactivado';
    } else {
      aux = 'activo';
    }
    await User.update({
      estado: aux
    }, { where: { rut: rut } });

    await user.save();

    res.json({
      msg: 'Usuario ' + aux + ' exitosamente',
    });
  } catch (error) {
    res.status(400).json({
      msg: 'Upps ocurrió un error',
      error
    });
  }
};
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ['rut', 'nombre', 'estado', 'rol','carrera']
    });
    res.json(users);
  } catch (error) {
    res.status(400).json({
      msg: 'Upps ocurrió un error',
      error
    });
  }
};
export const verifyUser = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const user = await User.findAll({ where: { verificationToken: token } });
    user[0].estado = 'activo'; // Set the estado to "activo"
    user[0].verificationToken = ''; // Clear the verification token
    await user[0].save(); // Save the updated user

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      logger: true,
      debug: true
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user[0].email,
      subject: 'Confirmación de correo electrónico',
      text: `Hola ${user[0].nombre},\n\nTu correo electrónico ha sido verificado exitosamente. Ahora puedes iniciar sesión en nuestra plataforma.\n\nGracias!`
    };

    await transporter.sendMail(mailOptions);

    res.json({
      msg: 'Correo verificado exitosamente, ahora puedes iniciar sesión',
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({
      msg: 'Error al verificar el correo, por favor intente nuevamente',
    });
  }
};


function validarRut(rut :any) {
  const valor = rut.replace(/\./g, "").split('-');
  const cuerpo = valor[0];
  const dv = valor[1].toUpperCase();
  let total = 0;
  let factor = 2;

  for(let i = cuerpo.length - 1; i >= 0; i--) {
    total += cuerpo.charAt(i) * factor;
    factor = (factor === 7) ? 2 : factor + 1;
  }

  const dvEsperado = 11 - (total % 11);
  if (dvEsperado === 11) return dv === '0';
  if (dvEsperado === 10) return dv === 'K';
  return dv === String(dvEsperado);
}

