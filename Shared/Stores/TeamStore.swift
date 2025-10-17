import Foundation
import Combine

public final class TeamStore: ObservableObject {
    private enum Keys {
        static let teams = "teams"
        static let attackConfigs = "attackConfigs"
        static let baseTeamID = "baseTeamID"
    }

    @Published public var teams: [Team] {
        didSet { persistTeams() }
    }

    @Published public var attackConfigs: [AttackConfig] {
        didSet { persistAttackConfigs() }
    }

    @Published public var baseTeamID: UUID? {
        didSet { persistBaseTeamID() }
    }

    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    private let defaults: UserDefaults
    private var isLoading = false

    public init(userDefaults: UserDefaults = .standard) {
        self.defaults = userDefaults
        self.isLoading = true

        if let data = defaults.data(forKey: Keys.teams),
           let decoded = try? decoder.decode([Team].self, from: data) {
            self.teams = decoded
        } else {
            self.teams = TeamSampleData.teams
        }

        if let data = defaults.data(forKey: Keys.attackConfigs),
           let decoded = try? decoder.decode([AttackConfig].self, from: data) {
            self.attackConfigs = decoded
        } else {
            self.attackConfigs = TeamSampleData.attackConfigs
        }

        if let idString = defaults.string(forKey: Keys.baseTeamID),
           let uuid = UUID(uuidString: idString) {
            self.baseTeamID = uuid
        } else {
            self.baseTeamID = teams.first?.id
        }

        self.isLoading = false
        ensureAttackConfigs()
    }

    public func team(with id: UUID?) -> Team? {
        guard let id else { return nil }
        return teams.first { $0.id == id }
    }

    public func targetTeam(for attackerID: UUID) -> Team? {
        guard let config = attackConfigs.first(where: { $0.attackerTeamID == attackerID }) else {
            return nil
        }
        return team(with: config.targetTeamID)
    }

    public func addTeam() {
        teams.append(Team(name: "New Team", emoji: "", members: []))
        ensureAttackConfigs()
    }

    public func removeTeams(at offsets: IndexSet) {
        let ids = offsets.map { teams[$0].id }
        teams.remove(atOffsets: offsets)
        attackConfigs.removeAll { ids.contains($0.attackerTeamID) || ids.contains($0.targetTeamID) }
        if let baseTeamID, !teams.contains(where: { $0.id == baseTeamID }) {
            self.baseTeamID = teams.first?.id
        }
    }

    public func moveTeams(from source: IndexSet, to destination: Int) {
        teams.move(fromOffsets: source, toOffset: destination)
    }

    public func updateTarget(attackerID: UUID, targetID: UUID) {
        if let index = attackConfigs.firstIndex(where: { $0.attackerTeamID == attackerID }) {
            attackConfigs[index].targetTeamID = targetID
        } else {
            attackConfigs.append(AttackConfig(attackerTeamID: attackerID, targetTeamID: targetID))
        }
    }

    private func ensureAttackConfigs() {
        for team in teams {
            if !attackConfigs.contains(where: { $0.attackerTeamID == team.id }) {
                let defaultTarget = teams.first(where: { $0.id != team.id })?.id ?? team.id
                attackConfigs.append(AttackConfig(attackerTeamID: team.id, targetTeamID: defaultTarget))
            }
        }
        attackConfigs = attackConfigs.filter { config in teams.contains(where: { $0.id == config.attackerTeamID }) }
    }

    private func persistTeams() {
        guard !isLoading else { return }
        if let data = try? encoder.encode(teams) {
            defaults.set(data, forKey: Keys.teams)
        }
        ensureAttackConfigs()
    }

    private func persistAttackConfigs() {
        guard !isLoading else { return }
        if let data = try? encoder.encode(attackConfigs) {
            defaults.set(data, forKey: Keys.attackConfigs)
        }
    }

    private func persistBaseTeamID() {
        guard !isLoading else { return }
        defaults.set(baseTeamID?.uuidString, forKey: Keys.baseTeamID)
    }
}
