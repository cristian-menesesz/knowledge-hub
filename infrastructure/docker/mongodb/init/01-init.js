// Create main database
db = db.getSiblingDB('knowledge_hub_dev');

// Create collections with validation
db.createCollection('content_drafts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'authorId', 'createdAt'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'Title is required and must be a string',
        },
        authorId: {
          bsonType: 'string',
          description: 'Author ID is required',
        },
        createdAt: {
          bsonType: 'date',
          description: 'Created date is required',
        },
      },
    },
  },
});

db.createCollection('asset_metadata', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['filename', 'mimetype', 'size', 'uploadedAt'],
      properties: {
        filename: {
          bsonType: 'string',
        },
        mimetype: {
          bsonType: 'string',
        },
        size: {
          bsonType: 'int',
        },
      },
    },
  },
});

// Create indexes
db.content_drafts.createIndex({ authorId: 1, createdAt: -1 });
db.content_drafts.createIndex({ updatedAt: -1 });
db.asset_metadata.createIndex({ uploadedAt: -1 });

print('MongoDB initialization complete');
