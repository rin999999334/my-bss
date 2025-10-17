import Foundation

public struct Member: Identifiable, Codable, Hashable {
    public var id: UUID
    public var name: String

    public init(id: UUID = UUID(), name: String) {
        self.id = id
        self.name = name
    }
}

public struct Team: Identifiable, Codable, Hashable {
    public var id: UUID
    public var name: String
    public var emoji: String
    public var members: [Member]

    public init(id: UUID = UUID(), name: String, emoji: String = "", members: [Member] = []) {
        self.id = id
        self.name = name
        self.emoji = emoji
        self.members = members
    }

    public var displayName: String {
        emoji.isEmpty ? name : "\(emoji) \(name)"
    }
}

public struct AttackConfig: Codable, Hashable {
    public var attackerTeamID: UUID
    public var targetTeamID: UUID

    public init(attackerTeamID: UUID, targetTeamID: UUID) {
        self.attackerTeamID = attackerTeamID
        self.targetTeamID = targetTeamID
    }
}

extension AttackConfig: Identifiable {
    public var id: UUID { attackerTeamID }
}

public enum TeamSampleData {
    public static let teams: [Team] = [
        Team(
            name: "Red Dragons",
            emoji: "🐉",
            members: [
                Member(name: "Akira"),
                Member(name: "Ren"),
                Member(name: "Mei")
            ]
        ),
        Team(
            name: "Blue Phoenix",
            emoji: "🪶",
            members: [
                Member(name: "Sora"),
                Member(name: "Kai"),
                Member(name: "Yui")
            ]
        ),
        Team(
            name: "Green Tigers",
            emoji: "🐯",
            members: [
                Member(name: "Haruka"),
                Member(name: "Tomo"),
                Member(name: "Nao")
            ]
        )
    ]

    public static let attackConfigs: [AttackConfig] = [
        AttackConfig(attackerTeamID: teams[0].id, targetTeamID: teams[1].id),
        AttackConfig(attackerTeamID: teams[1].id, targetTeamID: teams[2].id),
        AttackConfig(attackerTeamID: teams[2].id, targetTeamID: teams[0].id)
    ]
}
