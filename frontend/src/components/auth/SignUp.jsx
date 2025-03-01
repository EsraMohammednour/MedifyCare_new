import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import SocialLogin from './SocialLogin';
// import { Scrollbars } from 'react-custom-scrollbars';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

export default function SignUp() {
    const navigate = useNavigate();
    const [role, setRole] = useState('patient');

    const initialValues = {
        username: '',
        email: '',
        password: '',
        confirm: '',
        speciality: '',
        bio: '',
        image: null,
    };
    const validationSchema = Yup.object({
        username: Yup.string().required('Enter a user name'),
        email: Yup.string().email('Invalid email address').required('Enter an email address'),
        password: Yup.string().required('Enter a password'),
        confirm: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm your password'),
    });

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/register`, values);
            console.log(response);
            navigate('/signin');
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setSubmitting(false);
            resetForm();
        }
        console.log('Form Values:', values);
    }
    return (
        <>
            <main className="relative grow flex">
                <div className="w-full bg-light">
                    <div className="h-full flex flex-col justify-center before:min-h-[4rem] md:before:min-h-[5rem] before:flex-1 after:flex-1">
                        <div className="px-4 sm:px-6">
                            <div className="w-full max-w-sm mx-auto">
                                <div className="py-16 md:py-20">
                                    <div className="mb-8">
                                        <h1 className="h2 font-uncut-sans text-black">Sign Up</h1>
                                    </div>
                                    {/* Form */}
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={onSubmit}
                                    >
                                        {({ isSubmitting, setFieldValue }) => (
                                            <Form>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm text-gray-600 font-medium mb-1" htmlFor="username">User Name <span className="text-red-500">*</span></label>
                                                        <Field id="username" name='username' className="form-input py-2 w-full" type="text" required />
                                                        <ErrorMessage name="username" component="div" className="text-red-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-600 font-medium mb-1" htmlFor="email">Email <span className="text-red-500">*</span></label>
                                                        <Field id="email" name='email' className="form-input py-2 w-full" type="email" required />
                                                        <ErrorMessage name="email" component="div" className="text-red-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-600 font-medium mb-1" htmlFor="password">Password <span className="text-red-500">*</span></label>
                                                        <Field id="password" name='password' className="form-input py-2 w-full" type="password" autoComplete="on" required />
                                                        <ErrorMessage name="password" component="div" className="text-red-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-600 font-medium mb-1" htmlFor="confirm">Confirm Password <span className="text-red-500">*</span></label>
                                                        <Field id="confirm" name="confirm" className="form-input py-2 w-full" type="password" autoComplete="on" required />
                                                        <ErrorMessage name="confirm" component="div" className="text-red-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-600 font-medium mb-1" htmlFor="role">Role <span className="text-red-500">*</span></label>
                                                        <Field
                                                            as="select"
                                                            name="role"
                                                            id="role"
                                                            className="form-select py-2 w-full"
                                                            onChange={(e) => {
                                                                const selectedRole = e.target.value;
                                                                setRole(selectedRole);
                                                                setFieldValue('role', selectedRole);
                                                            }}>
                                                            <option value="patient">Patient</option>
                                                            <option value="doctor">Doctor</option>
                                                        </Field>
                                                        {/* <ErrorMessage name="role" component="div" className="text-red-500 text-sm" /> */}
                                                    </div>
                                                    {role === 'doctor' && (
                                                        <>
                                                            <div>
                                                                <label className="block text-sm text-gray-600 font-medium mb-1" htmlFor="speciality">Speciality</label>
                                                                <Field id="speciality" name="speciality" className="form-input py-2 w-full" type="text" />
                                                                {/* <ErrorMessage name="speciality" component="div" className="text-red-500" /> */}
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-gray-600 font-medium mb-1" htmlFor="bio">Bio</label>
                                                                <Field as="textarea" id="bio" name="bio" className="form-textarea py-2 w-full" rows="4" />
                                                                {/* <ErrorMessage name="bio" component="div" className="text-red-500" /> */}
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-gray-600 font-medium mb-1" htmlFor="image">Upload Image</label>
                                                                <input
                                                                    type="file"
                                                                    id="image"
                                                                    name="image"
                                                                    onChange={(event) => {
                                                                        setFieldValue('image', event.currentTarget.files[0] || null);
                                                                    }}
                                                                    className="form-input py-2 w-full"
                                                                />
                                                                <ErrorMessage name="image" component="div" className="text-red-500" />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="mt-6">
                                                    <button type='submit' className="btn-sm text-white bg-gradient-to-t from-primary to-primaryLight hover:to-primaryDark w-full shadow-lg group">
                                                        Sign Up <span className="tracking-normal text-blue-200 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span>
                                                    </button>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                    <SocialLogin />
                                    <div className="text-sm text-gray-500 italic mt-6 mb-4">
                                        By filling out this form, I consent to the collection and use of my personal data.
                                    </div>
                                    <div className="pt-4 border-t border-primary">
                                        <div className="text-sm text-gray-400">
                                            Already have an account? <Link className="font-medium text-secondary hover:text-secondaryLight" to="/signin">Sign In</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block shrink-0 w-2/5 overflow-hidden before:bg-primary before:absolute before:inset-0 before:-z-10">
                    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none -z-10" aria-hidden="true">
                        <img src="{..}" className="max-w-none" alt="Hero Illustration" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none -z-10" aria-hidden="true">
                        <img src="{...}" className="max-w-none" alt="Auth Illustration" />
                    </div>
                </div>

            </main>
        </>
    )
}
