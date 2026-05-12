import type { User } from '../../core/models/user.model';

export interface UserFormDialogData {
  mode: 'create' | 'edit';
  user?: User;
}
