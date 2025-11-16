import { Meteor } from 'meteor/meteor';
import { DocsCollection } from '../imports/api/docs';

Meteor.startup(() => {
  // Insert a test document with mock findings if it doesn't exist
  const testId = '2277nEXu2DEBkSSTJ';
  DocsCollection.findOneAsync(testId).then(doc => {
    if (!doc) {
      DocsCollection.insertAsync({
        _id: testId,
        name: 'Test Handbook',
        type: 'pdf',
        size: 123456,
        data: '',
        uploadedAt: new Date(),
        findings: [
          {
            law_clause: '1.1.1',
            compliance: 'No',
            type: 'Gap',
            comment: 'Missing required section.',
            user_chunks: ['Section 1', 'Section 2']
          },
          {
            law_clause: '2.2.2',
            compliance: 'Partial',
            type: 'Contradiction',
            comment: 'Conflicting statements found.',
            user_chunks: ['Section 3']
          }
        ],
        findingsSavedAt: new Date(),
        userId: null
      });
    }
  });
});
