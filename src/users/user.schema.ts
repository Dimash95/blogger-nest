import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ versionKey: false, collection: 'User' })
export class User {
  @Prop({ required: true, unique: true })
  login: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({
    type: {
      confirmationCode: String,
      recoveryCode: String,
      expirationDate: Date,
      isConfirmed: { type: Boolean, default: false },
    },
  })
  emailConfirmation: {
    confirmationCode: string;
    recoveryCode?: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };

  @Prop({ type: Array, default: [] })
  refreshTokens: any[];

  @Prop({ type: Array, default: [] })
  devices: any[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});
