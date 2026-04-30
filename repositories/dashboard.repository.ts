import { prisma } from "@/lib/prisma";

export async function getDashboardSummary(profileId: string) {
  const [contactsCount, conversationsCount, pendingFollowups, latestMessages] = await Promise.all([
    prisma.contact.count({ where: { profileId } }),
    prisma.conversation.count({
      where: {
        contact: {
          profileId
        }
      }
    }),
    prisma.followupJob.count({
      where: {
        status: "PENDING",
        contact: {
          profileId
        }
      }
    }),
    prisma.message.findMany({
      where: {
        contact: {
          profileId
        }
      },
      include: {
        contact: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 6
    })
  ]);

  return {
    contactsCount,
    conversationsCount,
    pendingFollowups,
    latestMessages
  };
}
