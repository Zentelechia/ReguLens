import './mockTestDoc';
// Save findings to DocsCollection
Meteor.methods({
  async 'findings.save'(docId, findings) {
    check(docId, String);
    check(findings, Array);
    // Recursively sanitize keys in findings
    function sanitizeKeys(obj) {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeKeys);
      } else if (obj && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
          if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
          let newKey = key.replace(/[.$]/g, '_');
          newObj[newKey] = sanitizeKeys(obj[key]);
        }
        return newObj;
      }
      return obj;
    }
    const sanitizedFindings = sanitizeKeys(findings);
    // Save findings array to the document with the given docId
    return await DocsCollection.updateAsync(docId, { $set: { findings: sanitizedFindings, findingsSavedAt: new Date() } });
  }
});
// Fetch a document by ID for DocPage rendering
Meteor.methods({
  async 'docs.get'(docId) {
    check(docId, String);
    return await DocsCollection.findOneAsync(docId);
  }
});
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { LinksCollection } from '/imports/api/links';
import { DocsCollection } from '/imports/api/docs';

Meteor.methods({
  'docs.upload'(file) {
    check(file, {
      name: String,
      type: String,
      size: Number,
      data: String,
    });
    // Save file info and base64 data (for demo; in production, use file storage)
    return DocsCollection.insertAsync({
      name: file.name,
      type: file.type,
      size: file.size,
      data: file.data,
      uploadedAt: new Date(),
      userId: this.userId || null,
    });
  }
});

// Publish the Docs collection for uploads
Meteor.publish("docs", function () {
  return DocsCollection.find();
});

async function insertLink({ title, url }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
}

Meteor.startup(async () => {
  // If the Links collection is empty, add some data.
  if (await LinksCollection.find().countAsync() === 0) {
    await insertLink({
      title: 'Do the Tutorial',
      url: 'https://react-tutorial.meteor.com/simple-todos/01-creating-app.html',
    });

    await insertLink({
      title: 'Follow the Guide',
      url: 'https://guide.meteor.com',
    });

    await insertLink({
      title: 'Read the Docs',
      url: 'https://docs.meteor.com',
    });

    await insertLink({
      title: 'Discussions',
      url: 'https://forums.meteor.com',
    });
  }

  // We publish the entire Links collection to all clients.
  // In order to be fetched in real-time to the clients
  Meteor.publish("links", function () {
    return LinksCollection.find();
  });
});
