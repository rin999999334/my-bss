import SwiftUI

@main
struct SukumiApp: App {
    @StateObject private var store = TeamStore()
    @State private var deepLinkedTeamID: UUID?

    private var deepLinkedTeamBinding: Binding<Team?> {
        Binding(
            get: {
                guard let id = deepLinkedTeamID else { return nil }
                return store.team(with: id)
            },
            set: { newValue in
                deepLinkedTeamID = newValue?.id
            }
        )
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .sheet(item: deepLinkedTeamBinding) { team in
                    MembersSheet(team: team)
                }
        }
        .onOpenURL { url in
            guard url.scheme == "sukumi",
                  url.host == "team",
                  let id = UUID(uuidString: url.lastPathComponent)
            else { return }
            deepLinkedTeamID = id
        }
    }
}
