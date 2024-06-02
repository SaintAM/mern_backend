import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  avatarUrl: String,
}, {
	timestamps: true // когда создается/изменяется модель, к ней прикручивается дата и время 
});

export default mongoose.model("User", UserSchema)