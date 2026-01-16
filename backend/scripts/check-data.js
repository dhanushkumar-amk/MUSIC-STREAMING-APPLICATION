import prisma from '../src/config/database.js';

async function checkData() {
  try {
    console.log('\n📊 PostgreSQL Database Summary\n');
    console.log('='.repeat(50));

    const counts = {
      'Users': await prisma.user.count(),
      'User Settings': await prisma.userSettings.count(),
      'Playlists': await prisma.playlist.count(),
      'Libraries': await prisma.library.count(),
      'Sessions': await prisma.session.count(),
      'Session Participants': await prisma.sessionParticipant.count(),
      'Chat Messages': await prisma.chatMessage.count(),
      'Recently Played': await prisma.recentlyPlayed.count(),
      'Recent Searches': await prisma.recentSearch.count(),
      'Recommendations': await prisma.recommendation.count(),
      'Lyrics': await prisma.lyrics.count(),
    };

    Object.entries(counts).forEach(([key, value]) => {
      console.log(`${key.padEnd(25)} ${value}`);
    });

    console.log('='.repeat(50));
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    console.log(`Total Records:            ${total}\n`);

    // Get sample user
    const sampleUser = await prisma.user.findFirst({
      include: {
        playlists: true,
        library: true,
      }
    });

    if (sampleUser) {
      console.log('✅ Sample User Found:');
      console.log(`   Email: ${sampleUser.email}`);
      console.log(`   Name: ${sampleUser.name || 'N/A'}`);
      console.log(`   Playlists: ${sampleUser.playlists.length}`);
      console.log(`   Library: ${sampleUser.library ? 'Yes' : 'No'}\n`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
