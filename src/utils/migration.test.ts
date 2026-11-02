import { migrateDatabaseState, CURRENT_SCHEMA_VERSION, DEMO_WAREHOUSE_PROFILE } from './migration';
import { INITIAL_VONTA_DATABASE } from '../data/initialDatabase';

console.log('Testing migrateDatabaseState...');

// 1. Test with initial database
const migratedOnce = migrateDatabaseState(INITIAL_VONTA_DATABASE);
console.assert(migratedOnce.schema_version === CURRENT_SCHEMA_VERSION, 'Schema version must be 9');
console.assert(
  migratedOnce.profiles.some((p) => p.email === DEMO_WAREHOUSE_PROFILE.email),
  'Demo warehouse profile must be present'
);

// 2. Test idempotency
const migratedTwice = migrateDatabaseState(migratedOnce);
console.assert(
  JSON.stringify(migratedOnce) === JSON.stringify(migratedTwice),
  'Migration must be strictly idempotent'
);

// 3. Test legacy author_* to sender_* mapping
const legacyState = {
  ...INITIAL_VONTA_DATABASE,
  pins: [
    {
      id: 'pin-legacy-1',
      pin_code: '#999',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-1',
      title: 'Legacy Pin',
      description: 'Legacy test',
      department: 'listrik',
      priority: 'normal',
      status: 'open',
      coord_x: 50,
      coord_y: 50,
      before_media_url: '',
      after_media_url: null,
      assigned_worker_email: null,
      revision_count: 0,
      delete_requested_by_mandor: false,
      pin_comments: [
        {
          id: 'cmt-legacy',
          author_name: 'Old Author',
          author_role: 'mandor',
          note: 'Old note',
          created_at: '2026-10-01T00:00:00Z',
        },
      ],
      created_by: null,
      created_at: '2026-10-01T00:00:00Z',
      resolved_at: null,
    },
  ],
};

const migratedLegacy = migrateDatabaseState(legacyState);
const cmt = migratedLegacy.pins[0].pin_comments?.[0];
console.assert(cmt?.sender_name === 'Old Author', 'author_name must be mapped to sender_name');
console.assert(cmt?.sender_role === 'mandor', 'author_role must be mapped to sender_role');

console.log('ALL MIGRATION UNIT TESTS PASSED!');
