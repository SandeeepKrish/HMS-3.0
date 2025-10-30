import mongoose from "mongoose";
import validator from "validator";

const appointmentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name Is Required!"],
      minlength: [3, "First Name Must Contain At Least 3 Characters!"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name Is Required!"],
      minlength: [3, "Last Name Must Contain At Least 3 Characters!"],
    },
    email: {
      type: String,
      required: [true, "Email Is Required!"],
      validate: [validator.isEmail, "Provide A Valid Email!"],
    },
    phone: {
      type: String,
      required: [true, "Phone Is Required!"],
      validate: {
        validator: (value) => /^[0-9]{10}$/.test(value),
        message: "Phone Number Must Contain Exactly 10 Digits!",
      },
    },

    // PID (patient identifier coming from frontend) - store as Number
    pid: {
      type: Number,
      required: [true, "PID Is Required!"],
      min: [0, "PID must be a positive number!"],
    },

    dob: {
      type: Date,
      required: [true, "DOB Is Required!"],
    },
    gender: {
      type: String,
      required: [true, "Gender Is Required!"],
      enum: ["Male", "Female"],
    },
    appointment_date: {
      type: String,
      required: [true, "Appointment Date Is Required!"],
    },
    department: {
      type: String,
      required: [true, "Department Name Is Required!"],
    },
    doctor: {
      firstName: {
        type: String,
        required: [true, "Doctor First Name Is Required!"],
      },
      lastName: {
        type: String,
        required: [true, "Doctor Last Name Is Required!"],
      },
    },
    hasVisited: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      required: [true, "Address Is Required!"],
    },

    // doctorId references the User (doctor) document
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Doctor Id Is Invalid!"],
    },

    // patientId stores numeric patient identifier (not MongoDB ObjectId)
    patientId: {
      type: Number,
      // not required so appointment creation won't fail if not provided as ObjectId
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
