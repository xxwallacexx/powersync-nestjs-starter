import { SetMetadata } from '@nestjs/common';
import { AppWorker, MetadataKey } from 'src/enum';
import { EmitEvent } from 'src/repositories/event.repository';

export type EventConfig = {
  name: EmitEvent;
  /** handle socket.io server events as well  */
  server?: boolean;
  /** lower value has higher priority, defaults to 0 */
  priority?: number;
  /** register events for these workers, defaults to all workers */
  workers?: AppWorker[];
};
export const OnEvent = (config: EventConfig) => SetMetadata(MetadataKey.EVENT_CONFIG, config);
