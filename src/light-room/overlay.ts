import { lightRoomContent } from './content.js';
import { LightRoomOverlaySchema } from './schema.js';

export const lightRoomOverlay = LightRoomOverlaySchema.parse(lightRoomContent);
