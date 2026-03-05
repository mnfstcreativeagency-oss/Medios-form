import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    fullName: string;
    age: number;
    gender: string;
    whatsappNumber: string;
    email: string;
    currentStatus: string;
    status: 'Pending' | 'Done with cold call';
    converted: 'Yes' | 'No' | 'Pending';
    createdAt: Date;
}

const ApplicationSchema: Schema = new Schema({
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female'] },
    whatsappNumber: { type: String, required: true },
    email: { type: String, required: true },
    currentStatus: { type: String, required: true, enum: ['Student', 'Working Professional', 'Freelancer'] },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Done with cold call'] },
    converted: { type: String, default: 'Pending', enum: ['Yes', 'No', 'Pending'] },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
