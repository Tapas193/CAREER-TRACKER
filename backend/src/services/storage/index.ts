import { StorageService } from './StorageService';
import { LocalStorageService } from './LocalStorageService';
import { config } from '../../config';

export function getStorageService(): StorageService {
  switch (config.storageDriver) {
    case 'local':
    default:
      return new LocalStorageService();
  }
}

export const storage = getStorageService();
